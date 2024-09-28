import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, Cell, toNano } from '@ton/core';
import { TonProxy } from '../wrappers/TonProxy';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('TonProxy', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TonProxy');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let tonProxy: SandboxContract<TonProxy>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');

        tonProxy = blockchain.openContract(
            TonProxy.createFromConfig(
                {
                    owner: deployer.address,
                },
                code,
            ),
        );

        const deployResult = await tonProxy.sendDeploy(deployer.getSender(), toNano('0.01'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tonProxy.address,
            deploy: true,
        });
    });

    it('should not forward from owner', async () => {
        const result = await deployer.send({
            to: tonProxy.address,
            value: toNano('1'),
        });
        expect(result.transactions).not.toHaveTransaction({
            from: tonProxy.address,
            to: deployer.address,
        });
    });

    it('should forward from another wallet', async () => {
        let user = await blockchain.treasury('user');
        const result = await user.send({
            to: tonProxy.address,
            value: toNano('1'),
            body: beginCell().storeStringTail('Hello, world!').endCell(),
        });
        expect(result.transactions).toHaveTransaction({
            from: tonProxy.address,
            to: deployer.address,
            body: beginCell()
                .storeAddress(user.address)
                .storeRef(beginCell().storeStringTail('Hello, world!').endCell())
                .endCell(),
            value: (x) => (x ? toNano('0.99') <= x && x <= toNano('1') : false),
        });
    });
});
