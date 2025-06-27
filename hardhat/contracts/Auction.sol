// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract Subasta is ERC721Holder{

    error Subasta_TheOfferIsNotHigher();
    error Subasta_AuctionHasEnded();
    error Subasta_AuctionStillRunning();
    error Subasta_DontHaveFunds();
    error Subasta_TransactionFailedToBeneficiary();
    error Subasta_TransactionFailedRefunding();
    error Subasta_FundsHaveReturned();
    error Subasta_OnlyBeneficiaryCanFinishAuction();
    error Subasta_BeneficiaryIsNotValid();
    error Subasta_AuctionNotStarted();
    error Subasta_AuctionAlreadyActive();
    error Subasta_NotOwnerOfNFT();

    struct Item{  // Representacion del Item
        string nombre;
        string descripcion;
        uint256 expireAt;
    } 

    struct Offers{ //Struct que nos permite manejar la ultima/actual oferta emitida
        uint256 lastOffer;
        uint256 currentOffer;
    }

    address public beneficiary; //beneficiario
    address public currentBidder; //direccion de oferente mas alta visiblemente publica
    uint256 public currentOffer; //oferta mas alta visiblemente publica
    uint256 public tokenId; //id del NFT que se subastara, visiblemente publica
    bool public isEnded = false; //bandera si la funcion de devolucion a sido activada
    bool public isActive = false;
    mapping  (address => Offers) bidders; //control de direcciones con su manejo de ofertas
    mapping (address => bool)  biddersRegister; //control para que solamente puedan ingresar a la lista de ofertantes una vez
    address[] biddersList; //lista de direcciones de ofertantes
    Item public item; //Item a ofertar

    IERC721 public nftContract; //Contrato del NFT que se subastara

    event NewOffer(address newBidder,uint256 amount);
    event TimeExtended(uint256 newExpireAt);
    event AuctionEnded(address winner, uint256 amount, uint256 timeEnded);
    event AuctionStarted(uint256 tokenId, uint256 expireAt);

    modifier auctionRunning() { //modificador para verificar que la oferta siga corriendo
        if (!isActive) revert Subasta_AuctionNotStarted();
        if (block.timestamp > item.expireAt) revert Subasta_AuctionHasEnded();
        _;
    }

    modifier onlyBeneficiary() {
        if(msg.sender != beneficiary) revert Subasta_OnlyBeneficiaryCanFinishAuction();
        _;
    }

    //el tiempo nos llegara en minutos
    constructor(address _nftContract){
        beneficiary = msg.sender; 
        nftContract = IERC721(_nftContract);
    }

    function startAuction(
        uint256 _initialValue,
        string memory _nameItem,
        string memory _descriptionItem,
        uint256 _durationtime, //en minutos
        uint256 _tokenId
    ) external onlyBeneficiary {

        if(isActive) revert Subasta_AuctionAlreadyActive();
        
        _resetAuctionState();

        tokenId = _tokenId;
        uint256 time = block.timestamp + _durationtime * 1 minutes;
        
        item = Item({
            nombre: _nameItem,
            descripcion: _descriptionItem,
            expireAt: time
        });
        
        currentOffer = _initialValue;
        isActive = true;
        isEnded = false;
        
        // Transferir NFT al contrato
        nftContract.safeTransferFrom(beneficiary, address(this), _tokenId);
        
        emit AuctionStarted(_tokenId,time);
    }
    
    function _resetAuctionState() private {
        // Limpiar datos de oferentes anteriores
        for(uint256 i = 0; i < biddersList.length; i++) {
            address bidder = biddersList[i];
            delete bidders[bidder];
            delete biddersRegister[bidder];
        }
        delete biddersList;
        
        // Resetear variables globales
        currentBidder = address(0);
        currentOffer = 0;
        tokenId = 0;
    }

    function offer() external payable auctionRunning {

        if(msg.value + bidders[msg.sender].currentOffer <= currentOffer + (currentOffer * 5 /100)){
            revert Subasta_TheOfferIsNotHigher();
        }

        // Extiende la subasta si está cerca del final
        if(block.timestamp <= item.expireAt && block.timestamp >= item.expireAt - 10 minutes){
            item.expireAt += 10 minutes;
            emit TimeExtended(item.expireAt);
        }

        // Registro del nuevo postor si es la primera vez
        if (!biddersRegister[msg.sender]) {
            biddersRegister[msg.sender] = true;
            biddersList.push(msg.sender);
        }

        //si es primera vez que realiza una oferta o ya vacio sus ofertas y quiere ingresar de nuevo
        if (bidders[msg.sender].lastOffer == 0 && bidders[msg.sender].currentOffer == 0) {
            // Primera vez que participa
            bidders[msg.sender].lastOffer = msg.value;
            bidders[msg.sender].currentOffer = msg.value;
        } else {
            bidders[msg.sender].lastOffer = bidders[msg.sender].currentOffer;
            bidders[msg.sender].currentOffer += msg.value;
        }

        // Actualiza el mejor postor y la mejor oferta global
        currentBidder = msg.sender;
        currentOffer = bidders[msg.sender].currentOffer;

        emit NewOffer(msg.sender, bidders[msg.sender].currentOffer);
    }

    function refund() external auctionRunning{
        //si el postor ya no tiene fondos no puede retirar mas
        if(bidders[msg.sender].lastOffer == 0){
            revert Subasta_DontHaveFunds();
        }

        //actualizacion de fondos a retirar
        //se devuelve la ultima oferta, la oferta actual se resta de la ultima
        //la ultima oferta y la actual llegan a ser iguales
        uint256 amount = bidders[msg.sender].lastOffer; //monto a devolver de la ultima oferta
        bidders[msg.sender].lastOffer = bidders[msg.sender].currentOffer - amount; //actualizamos la ultima oferta y la actual
        bidders[msg.sender].currentOffer = bidders[msg.sender].lastOffer; 
        //al quitar fondos tanto la ultima oferta como la actual serian iguales

        //si el que retira es por el momento el ganador, si retira pero ya no es el ganador
        //se busca un nuevo ganandor
        if(currentBidder == msg.sender && bidders[msg.sender].currentOffer < currentOffer){
            searchNewHigherBidder();
        }
        
        //se envia el retiro
        (bool success,) = msg.sender.call{value:amount}("");

        if(!success){
            revert Subasta_TransactionFailedRefunding();
        }
    }

    //devuelve al ganador actual
    function getWinner() external view returns (address winner, uint256 amount) {
        return (currentBidder, currentOffer);
    }

    //devuelve a los ofertantes con sus ofertas en curso
    function getAllOffers() external view returns (address[] memory, uint256[] memory) {
        uint256[] memory offers = new uint256[](biddersList.length);
        for (uint256 i = 0; i < biddersList.length; i++) {
            offers[i] = bidders[biddersList[i]].currentOffer;
        }
        return (biddersList, offers);
    }

    //solo el beneficiario puede terminar la subasta si es que el tiempo ya expiro
    //retira los fondos ganados
    //llama a la funcion para devolver el dinero  a los demas concursantes
    //emite el evento de finalizacion con los datos del ganador 
    function endAuction() external onlyBeneficiary{
        if(block.timestamp < item.expireAt){
            revert Subasta_AuctionStillRunning(); 
        }

        if(!isEnded){
            isEnded = true;

            (bool success,)  = beneficiary.call{value:currentOffer}("");
            if(!success){
                revert Subasta_TransactionFailedToBeneficiary();
            }

            nftContract.safeTransferFrom(address(this), currentBidder, tokenId); //transfiere el NFT al ganador
            returnFunds();
            emit AuctionEnded(currentBidder, currentOffer, block.timestamp);
        }else{
            revert Subasta_FundsHaveReturned();
        }
    }

    //devuelve los fondos a los participantes perdedores
    function returnFunds() private {

        uint256 amountToSendBeneficiary = 0;

        for(uint256 i = 0; i < biddersList.length; i++){
            uint256 amount = bidders[biddersList[i]].currentOffer;
            bidders[biddersList[i]].lastOffer = 0;
            bidders[biddersList[i]].currentOffer = 0;
            

            //devuelve los fondos a todos menos al ganador
            //la comision del  2% se agrega a todos menos al ganador
            if(currentBidder != biddersList[i]){
                uint256 amountToRefund = amount - amount * 2 / 100;
                amountToSendBeneficiary += amount * 2 /100;

                (bool success,)  = biddersList[i].call{value:amountToRefund}("");
                if(!success){
                    revert Subasta_TransactionFailedRefunding();
                }
            }
        }

        (bool successBeneficiary,) = beneficiary.call{value:amountToSendBeneficiary}("");
        if(!successBeneficiary){
            revert Subasta_TransactionFailedToBeneficiary();
        }
    }

    //busca al nuevo ganador y actualiza estados 
    function searchNewHigherBidder() private {
        uint256 highestOffer = 0;
        address highestBidder = address(0);

        for (uint256 i = 0; i < biddersList.length; ++i) {
            address bidder = biddersList[i];
            uint256 offert = bidders[bidder].currentOffer;

            if (offert > highestOffer) {
                highestOffer = offert;
                highestBidder = bidder;
            }
        }

        currentOffer = highestOffer;
        currentBidder = highestBidder;
    }

    // Función para obtener información de cualquier dirección 
    function getBidderInfo(address bidder) external view returns (
        uint256 currentOffert,
        uint256 lastOffer,
        bool isRegistered,
        bool isCurrentWinner
    ) {
        currentOffert = bidders[bidder].currentOffer;
        lastOffer = bidders[bidder].lastOffer;
        isRegistered = biddersRegister[bidder];
        isCurrentWinner = (currentBidder == bidder && currentOffer > 0);
        
        return (currentOffert, lastOffer, isRegistered, isCurrentWinner);
    }
}