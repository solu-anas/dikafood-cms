import config from "../config";

export async function getBankAccounts({ page, status, limit }) {
    const params = new URLSearchParams();
    params.set("isSuspended", status);
    params.set("limit", limit)
    const skip = (page - 1) * limit;
    if (skip > 0) {
        params.set("skip", skip)
    }
    const response = await fetch(config.API_BASE + "/management/bank-accounts/list?" + params.toString(), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include"
    })

    const { bankAccounts, counts } = await response.json()

    const formattedBanks = bankAccounts.map(({ bankAccountId, ...data }) => (
        {
            bankAccountId,
            data,
            isSelected: false,
            isOpen: {}
        }
    ))
    return { banks: formattedBanks, counts: counts }
}