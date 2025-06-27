// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721{

    struct TokenMetaData{
        string name;
        string description;
        string imageHash;
        uint256 createdAt;
    }

    // State variables
    uint256 private _tokenIdCounter;
    string private _baseTokenURI = "https://ipfs.io/ipfs/";
    mapping (uint256 => string) _tokenHashesIPFS;
    mapping (uint256 => TokenMetaData) private _tokenMetaData;
    address public owner;

    constructor() ERC721("Collection of art.", "COA") {
        owner = msg.sender;
        _tokenIdCounter = 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    //Metadata JSON information
    function tokenURI(uint256 tokenId) public view override returns (string memory){
        require(tokenId > 0 && tokenId < _tokenIdCounter, "ERC721Metadata: URI query for nonexistent token");

        return string(abi.encodePacked(_baseTokenURI, _tokenHashesIPFS[tokenId]));
    }

    //The owner mints his owns NFT to auction them
    function mintNFT(
        string memory hashIPFSJSONData,
        string memory name,
        string memory description,
        string memory imageHash
        )external onlyOwner {
            require(bytes(hashIPFSJSONData).length > 0, "Hash IPFS cannot be empty");
            require(bytes(name).length > 0, "Name cannot be empty");


            _tokenHashesIPFS[_tokenIdCounter] = hashIPFSJSONData;
            _tokenMetaData[_tokenIdCounter] = TokenMetaData({
                name: name,
                description: description,
                imageHash: imageHash,
                createdAt: block.timestamp
            });

            _safeMint(owner, _tokenIdCounter);
            _tokenIdCounter++;
    }


    function getTokenMetadata(uint256 tokenId) external view returns (
        string memory name,
        string memory description,
        string memory hashImage,
        string memory fullTokenURI,
        address tokenOwner,
        uint256 createdAt,
        bool exists
    ) {
        if (!(tokenId > 0 && tokenId < _tokenIdCounter)) {
            return ("", "", "", "", address(0), 0, false);
        }
        
        TokenMetaData memory metadata = _tokenMetaData[tokenId];
        return (
            metadata.name,
            metadata.description,
            string(abi.encodePacked(_baseTokenURI,metadata.imageHash)),
            tokenURI(tokenId),
            ownerOf(tokenId),
            metadata.createdAt,
            true
        );
    }

    //Total nfts
    function getTotalTokens() external view returns (uint256) {
        return _tokenIdCounter - 1; 
    }

    //In the end of auction the owner transfer the NFT
    function transferNFT(address to, uint256 tokenId) external onlyOwner{
        require(tokenId > 0 && tokenId < _tokenIdCounter, "Token does not exist");
    
        _transfer(owner, to, tokenId);
    }
}