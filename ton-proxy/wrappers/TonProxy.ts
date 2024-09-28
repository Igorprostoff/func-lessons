import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, Slice } from '@ton/core';

export type TonProxyConfig = {
    owner: Address;
};

export function tonProxyConfigToCell(config: TonProxyConfig): Cell {
    return beginCell().storeAddress(config.owner).endCell();
}

export class TonProxy implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new TonProxy(address);
    }

    static createFromConfig(config: TonProxyConfig, code: Cell, workchain = 0) {
        const data = tonProxyConfigToCell(config);
        const init = { code, data };
        return new TonProxy(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendMessage(provider: ContractProvider, via: Sender, value: bigint, address: Address, message: string) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeAddress(address)
                .storeRef(beginCell().storeStringTail(message).endCell())
                .endCell(),
        });
    }
}
