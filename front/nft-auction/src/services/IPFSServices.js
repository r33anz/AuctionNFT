const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export const pinFileToIPFS = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: formData
    }); 

    const response = await res.json();
    return response.IpfsHash;
}

export const creatJSONFile = (name,description,fileHash) => {
    return {
        name,
        description,
        image: 'https://ipfs.io/ipfs/'+fileHash,
      };
}



