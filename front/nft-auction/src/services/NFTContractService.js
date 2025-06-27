import NFTContract from "../contracts/NFTContractInstance";

export const mintNFT = async (jsonHash,name,description,imageHash) => {
    try {
        await NFTContract.connectWithSigner()
        const isOwner = await NFTContract.isOwnerConnected()
        
        if (!isOwner) {
          alert("No eres el owner del contrato")
          return
        }

        const tx = await NFTContract.mintNFT(
          jsonHash,
          name,
          description,
          imageHash
        )

        await tx.wait()
      } catch (error) {
        console.error("Error al mintear:", error)
        throw error.message || "Error al mintear el NFT."
      }
}

export const getTotalNFTs = async () => {
    try {
        
        const totalNFTs = await NFTContract.getTotalNFTs()
        return totalNFTs
    } catch (error) {
        console.error("Error al obtener el total de NFTs:", error)
        throw error.message || "Error al obtener el total de NFTs."
    }
}

export const getTokenMetadata = async (tokenId) => {
    try {
        const metadata = await NFTContract.getTokenMetadata(tokenId)
        
        if (!metadata || !metadata.exists) {
            return null
        }
        return metadata
    } catch (error) {
        console.error(`Error al obtener los metadatos del token ${tokenId}:`, error)
        throw error.message || `Error al obtener los metadatos del token ${tokenId}.`
    }
}