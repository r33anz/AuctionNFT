import { useState,useEffect } from "react"
import { Search, Gavel, Clock, DollarSign, Loader2 as Loader} from "lucide-react"
import { getTotalNFTs,getTokenMetadata } from "../services/NFTContractService"
import { createAuction } from "../services/AuctionService";
import { ethers } from "ethers";

//
import AuctionContractInstance from "../contracts/AuctionContractInstance";

function CreateAuction() {
  const [nftId, setNftId] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [auctionDuration, setAuctionDuration] = useState("24");
  const [nftData, setNftData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [availableNFTs, setAvailableNFTs] = useState([]);
  const [totalNFTs, setTotalNFTs] = useState(0);

  useEffect(() => {
    const init = async () => {
      try {
        const total = await getTotalNFTs();
        //const ans = await AuctionContractInstance.getStatus();
        //console.log("Auction status:", ans);
        setTotalNFTs(total);
      } catch (error) {
        console.error("Error initializing NFT service:", error);
      }
    };

    init();
  }, []);

  const handleSearchNFT = async () => {
    if (!nftId.trim()) {
      setError("Por favor ingresa el ID de tu NFT");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      
      const nft = await getTokenMetadata(Number(nftId));
      
      if (!nft) {
        setError(`NFT con ID ${nftId} no encontrado`);
        setNftData(null);
        return;
      }

      setNftData(nft);
      setError("");
    } catch (error) {
      console.error("Error fetching NFT:", error);
      setError("Error al buscar el NFT. Verifica el ID e intenta nuevamente");
      setNftData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuction = (e) => {
    e.preventDefault()

    if (!nftData) {
      setError("Primero busca tu NFT")
      return
    }
    if (!startingPrice || Number.parseFloat(startingPrice) <= 0) {
      setError("Ingresa un precio inicial válido")
      return
    }
    if (!auctionDuration || Number.parseInt(auctionDuration) <= 0) {
      setError("Selecciona una duración válida para la subasta")
      return
    }
    const weiAmount = ethers.parseEther(startingPrice.toString());
    createAuction(weiAmount, nftData.name, nftData.description, auctionDuration, nftData.id);
    
    setSuccess(
      `¡Subasta creada exitosamente! Tu NFT "${nftData.name}" está ahora en subasta por ${auctionDuration} horas con precio inicial de ${startingPrice} ETH.`,
    )

    // Limpiar formulario
    setStartingPrice("")
    setAuctionDuration("24")
  }

  function minutesToText(minutes) {
    const mins = parseInt(minutes);
    if (mins < 60) return `${mins} minutos`;
    if (mins < 1440) return `${Math.floor(mins / 60)} horas`;
    if (mins < 10080) return `${Math.floor(mins / 1440)} días`;
    return `${Math.floor(mins / 10080)} semanas`;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Crear Subasta</h1>
          <p className="text-gray-600">
            {totalNFTs > 0 
              ? `Hay ${totalNFTs} NFTs disponibles en la colección`
              : "Cargando información de la colección..."}
          </p>
        </div>

        {/* Search NFT Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Buscar tu NFT</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="nftId" className="block text-sm font-medium text-gray-700 mb-2">
                ID de tu NFT
              </label>
              <input
                type="number"
                id="nftId"
                value={nftId}
                onChange={(e) => setNftId(e.target.value)}
                placeholder={`Ingresa el ID (1-${totalNFTs})`}
                min="1"
                max={totalNFTs}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleSearchNFT()}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearchNFT}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </div>

          {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
          {success && <div className="mt-3 text-green-600 text-sm">{success}</div>}
        </div>

        {/* NFT Details and Auction Setup */}
        {nftData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NFT Preview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Vista previa del NFT</h3>

              <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                <img
                  src={nftData.image}
                  alt={nftData.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = `https://cloudflare-ipfs.com/ipfs/${nftData.image.split('/ipfs/')[1]}`
                  }}
                />
              </div>

              <h4 className="text-lg font-bold text-gray-900 mb-2">{nftData.name}</h4>
              <p className="text-gray-600 mb-4">{nftData.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Token ID:</span>
                  <span className="font-mono text-gray-900">#{nftData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Propietario:</span>
                  <span className="font-mono text-gray-900">
                    {nftData.owner.slice(0, 6)}...{nftData.owner.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Creado:</span>
                  <span className="text-gray-900">
                    {new Date(nftData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Metadata:</span>
                  <a 
                    href={nftData.tokenURI} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Ver en IPFS
                  </a>
                </div>
              </div>
            </div>

            {/* Auction Configuration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Configurar Subasta</h3>

              <form onSubmit={handleCreateAuction} className="space-y-6">
                {/* Starting Price */}
                <div>
                  <label htmlFor="startingPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Precio inicial (ETH) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="startingPrice"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                    placeholder="0.1"
                    step="0.01"
                    min="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Este será el precio mínimo de puja</p>
                </div>

                {/* Auction Duration */}
                <div>
                  <label htmlFor="auctionDuration" className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Duración de la subasta
                  </label>
                  <select
                    id="auctionDuration"
                    value={auctionDuration}
                    onChange={(e) => setAuctionDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="5">5 minutos</option>
                    <option value="10">10 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="360">6 horas</option>
                    <option value="720">12 horas</option>
                    <option value="1440">24 horas</option>
                    <option value="4320">3 días</option>
                    <option value="10080">1 semana</option>
                  </select>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Resumen de la subasta:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• NFT: {nftData.name}</li>
                    <li>• Precio inicial: {startingPrice || "0"} ETH</li>
                    <li>• Duración: {minutesToText(auctionDuration)}</li>
                    <li>
                      • Finaliza:{" "}
                      {startingPrice &&
                        new Date(Date.now() + Number.parseInt(auctionDuration) * 60 * 1000).toLocaleString()}
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <Gavel className="w-4 h-4" />
                  Crear Subasta
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!nftData && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">¿Cómo crear una subasta?</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Ingresa el ID del NFT que quieres subastar</li>
              <li>• Verifica que los datos del NFT sean correctos</li>
              <li>• Establece el precio inicial de la subasta</li>
              <li>• Selecciona la duración de la subasta</li>
              <li>• Confirma y publica tu subasta</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateAuction;