import {  Address, Cell, Slice, toNano } from '@ton/core';
import { TonProxy } from '../wrappers/TonProxy';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    let sender_address = provider.sender().address;
    
    if (!sender_address) {
        throw 'No sender provided';
    }

    const tonProxy = provider.open(
        TonProxy.createFromConfig(
            {
                owner: sender_address,
            },
            await compile('TonProxy'),
        ),
    );
    
    await tonProxy.sendMessage(provider.sender(), toNano('0.01'), Address.parse("UQA-BW9UE4s9ddl7vPwy415nz5cNOovOU92C4ufvHf4Aq6D8"), "string message");
}
