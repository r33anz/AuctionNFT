import { useState } from "react"
import { Gavel, Clock, User, ArrowLeft, TrendingUp, Eye } from "lucide-react"

function AuctionViewer() {
  const [currentView, setCurrentView] = useState("dashboard") // "dashboard" o "auction"
  const [selectedAuction, setSelectedAuction] = useState(null)
  const [bidAmount, setBidAmount] = useState("")
  const [userAddress] = useState("0x742d35Cc6634C0532925a3b8D4C9db96590c4C5d") // Dirección del usuario actual
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Datos mock de subastas activas
  const activeAuctions = [
    {
      id: "auction_1",
      nft: {
        id: "101",
        name: "Crypto Art #1234",
        description: "Una obra de arte digital única con elementos abstractos",
        image: "/placeholder.svg?height=400&width=400",
        contract: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
        tokenStandard: "ERC-721",
        blockchain: "Ethereum",
        attributes: [
          { trait_type: "Color", value: "Azul" },
          { trait_type: "Rareza", value: "Épico" },
          { trait_type: "Estilo", value: "Abstracto" },
        ],
      },
      seller: "0x1234567890123456789012345678901234567890",
      startingPrice: "0.5",
      currentBid: "2.3",
      currentWinner: "0x9876543210987654321098765432109876543210",
      totalBids: 12,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Hace 2 horas
      endTime: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // En 22 horas
      bidHistory: [
        { bidder: "0x1111...2222", amount: "0.5", time: "Hace 2 horas" },
        { bidder: "0x3333...4444", amount: "0.8", time: "Hace 1 hora" },
        { bidder: "0x5555...6666", amount: "1.2", time: "Hace 45 min" },
        { bidder: "0x7777...8888", amount: "1.8", time: "Hace 20 min" },
        { bidder: "0x9876...3210", amount: "2.3", time: "Hace 5 min" },
      ],
    },
  ]

  // Simular si hay subastas activas (puedes cambiar esto para probar)
  const hasActiveAuctions = activeAuctions.length > 0

  const handleViewAuction = (auction) => {
    setSelectedAuction(auction)
    setCurrentView("auction")
    setError("")
    setSuccess("")
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
    setSelectedAuction(null)
    setBidAmount("")
    setError("")
    setSuccess("")
  }

  const handlePlaceBid = (e) => {
    e.preventDefault()

    if (!bidAmount || Number.parseFloat(bidAmount) <= 0) {
      setError("Ingresa un monto válido para la puja")
      return
    }

    if (Number.parseFloat(bidAmount) <= Number.parseFloat(selectedAuction.currentBid)) {
      setError(`La puja debe ser mayor a ${selectedAuction.currentBid} ETH`)
      return
    }

    if (userAddress.toLowerCase() === selectedAuction.currentWinner.toLowerCase()) {
      setError("Ya eres el ganador actual de esta subasta")
      return
    }

    // Simular puja exitosa
    const newBid = {
      bidder: userAddress,
      amount: bidAmount,
      time: "Ahora",
    }

    // Actualizar datos de la subasta
    setSelectedAuction((prev) => ({
      ...prev,
      currentBid: bidAmount,
      currentWinner: userAddress,
      totalBids: prev.totalBids + 1,
      bidHistory: [newBid, ...prev.bidHistory],
    }))

    setSuccess(`¡Puja de ${bidAmount} ETH realizada exitosamente! Ahora eres el ganador actual.`)
    setBidAmount("")
    setError("")
  }

  const formatTimeRemaining = (endTime) => {
    const now = new Date()
    const end = new Date(endTime)
    const diff = end - now

    if (diff <= 0) return "Subasta finalizada"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m restantes`
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Vista Dashboard
  if (currentView === "dashboard") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Subastas Activas</h1>
            <p className="text-gray-600">Participa en subastas de NFTs en tiempo real</p>
          </div>

          {/* Estado de subastas */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            {hasActiveAuctions ? (
              <div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gavel className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Hay subastas en curso!</h2>
                <p className="text-gray-600 mb-6">
                  Actualmente hay {activeAuctions.length} subasta{activeAuctions.length > 1 ? "s" : ""} activa
                  {activeAuctions.length > 1 ? "s" : ""}
                </p>

                <div className="space-y-4">
                  {activeAuctions.map((auction) => (
                    <div key={auction.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={auction.nft.image || "/placeholder.svg"}
                          alt={auction.nft.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">{auction.nft.name}</h3>
                          <p className="text-sm text-gray-600">Puja actual: {auction.currentBid} ETH</p>
                          <p className="text-sm text-gray-500">{formatTimeRemaining(auction.endTime)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewAuction(auction)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Subasta
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gavel className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No hay subastas activas</h2>
                <p className="text-gray-600">
                  Actualmente no hay subastas en curso. Vuelve más tarde para participar en nuevas subastas.
                </p>
              </div>
            )}
          </div>

          {/* Info del usuario */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800">Tu dirección:</span>
              <span className="font-mono text-blue-900">{formatAddress(userAddress)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Vista de Subasta Detallada
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header con botón de regreso */}
        <div className="mb-6">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a subastas
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Subasta en Curso</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* NFT Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
              <img
                src={selectedAuction.nft.image || "/placeholder.svg"}
                alt={selectedAuction.nft.name}
                className="w-full h-full object-cover"
              />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedAuction.nft.name}</h2>
            <p className="text-gray-600 mb-4">{selectedAuction.nft.description}</p>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Token ID:</span>
                <span className="font-mono text-gray-900">#{selectedAuction.nft.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vendedor:</span>
                <span className="font-mono text-gray-900">{formatAddress(selectedAuction.seller)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Blockchain:</span>
                <span className="text-gray-900">{selectedAuction.nft.blockchain}</span>
              </div>
            </div>

            {/* Attributes */}
            {selectedAuction.nft.attributes && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Atributos:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedAuction.nft.attributes.map((attr, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                      <div className="text-gray-500">{attr.trait_type}</div>
                      <div className="font-medium text-gray-900">{attr.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Auction Info and Bidding */}
          <div className="space-y-6">
            {/* Auction Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Estado de la Subasta</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">Puja actual:</span>
                  <span className="text-2xl font-bold text-green-600">{selectedAuction.currentBid} ETH</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Ganador actual:</span>
                  <span className="font-mono text-blue-600">
                    {selectedAuction.currentWinner.toLowerCase() === userAddress.toLowerCase()
                      ? "¡Tú!"
                      : formatAddress(selectedAuction.currentWinner)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Tiempo restante:
                  </span>
                  <span className="font-medium text-gray-900">{formatTimeRemaining(selectedAuction.endTime)}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Total de pujas:
                  </span>
                  <span className="font-medium text-gray-900">{selectedAuction.totalBids}</span>
                </div>
              </div>
            </div>

            {/* Bidding Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Realizar Puja</h3>

              <form onSubmit={handlePlaceBid} className="space-y-4">
                <div>
                  <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Tu puja (ETH) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="bidAmount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Mínimo ${Number.parseFloat(selectedAuction.currentBid) + 0.1} ETH`}
                    step="0.01"
                    min={Number.parseFloat(selectedAuction.currentBid) + 0.01}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <Gavel className="w-4 h-4" />
                  Pujar {bidAmount && `${bidAmount} ETH`}
                </button>
              </form>

              {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
              {success && <div className="mt-3 text-green-600 text-sm">{success}</div>}
            </div>

            {/* Bid History */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Historial de Pujas</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedAuction.bidHistory.map((bid, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-mono text-sm text-gray-900">{formatAddress(bid.bidder)}</span>
                      {bid.bidder.toLowerCase() === userAddress.toLowerCase() && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Tú</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{bid.amount} ETH</div>
                      <div className="text-xs text-gray-500">{bid.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuctionViewer;
