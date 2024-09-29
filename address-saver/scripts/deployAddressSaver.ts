import { toNano } from '@ton/core';
import { AddressSaver } from '../wrappers/AddressSaver';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    let sender_address = provider.sender().address;
    if (!sender_address) {
        throw 'No sender provided';
    }
    const addressSaver = provider.open(
        AddressSaver.createFromConfig(
            {
                manager: sender_address,
            },
            await compile('AddressSaver'),
        ),
    );

    await addressSaver.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(addressSaver.address);

    // run methods on `addressSaver`
}
