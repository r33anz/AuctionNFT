import AuctionContractInstance from "../contracts/AuctionContractInstance.js";
import NFTContractInstance from "../contracts/NFTContractInstance.js";

export const createAuction = 
    async (
        initialValue,
        nameItem,
        descriptionItem,
        durationTime,
        tokeinId
    ) => {
    try {
        await AuctionContractInstance.connectWithSigner();
        const signerAddress = await AuctionContractInstance.signer.getAddress();
        
        const owner = await NFTContractInstance.ownerOf(tokeinId);
        console.log("Owner of the NFT:", owner);
        
        if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error("No eres el propietario de este NFT");
        }

        const approvedAddress = await NFTContractInstance.getApproved(tokeinId);
        console.log("Approved address:", approvedAddress);
        
        const auctionContractAddress = await AuctionContractInstance.getAddress();
        console.log("Auction contract address:", auctionContractAddress);
        console.log("Approved address:", approvedAddress);
        if (approvedAddress !== auctionContractAddress) {
        console.log("Otorgando aprobación al contrato de subasta...");
        
        // Conectar NFTContract con el signer para aprobar
        await NFTContractInstance.connectWithSigner();
        
        const approveTx = await NFTContractInstance.approve(
            auctionContractAddress, 
            tokeinId
        );
        await approveTx.wait();
        console.log("Aprobación completada:", approveTx.hash);
        }


        const tx = await AuctionContractInstance.createAuction(
            initialValue,
            nameItem,
            descriptionItem,
            durationTime,
            tokeinId
        );
        await tx.wait();
        console.log("Subasta creada exitosamente:", tx);
    } catch (error) {
        console.error("Error al crear la subasta:", error);
        throw error.message || "Error al crear la subasta.";
    }
}