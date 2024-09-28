import { toNano } from '@ton/core';
import { TonProxy } from '../wrappers/TonProxy';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    let sender_address = provider.sender().address
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

    await tonProxy.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(tonProxy.address);

    // run methods on `tonProxy`
}
