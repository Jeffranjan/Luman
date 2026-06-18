import { corsair } from "./corsair";

const main = async () => {
    const res = await corsair.withTenant("Ranjan").gmail.db.threads.search({
        data: {
            snippet: {
                contains: "50%  off now"
            }
        }
    });

    console.log(res);
};

main();
