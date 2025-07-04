import { useState } from "react"
import { Play, Bell, Shuffle, Clock, MessageSquare } from "lucide-react"
import { getStateAuction,endAuction } from "../services/AuctionService"

function StateAuction() {
    const [message, setMessage] = useState("Presiona cualquier botón para ver la acción")
    const [auctionData, setAuctionData] = useState(null)

    const handleConsoleLog = async () => {
        const state = await getStateAuction();
        setMessage(`Subasta terminada : ${state.isEnded ? "Sí" : "No"},
        ${state.isActive ? "Activa" : "Inactiva"},
        ${state.item.name}, ${state.item.description},
        Expira: ${state.item.expireAt},`);
    }

    const handleEndAuction = async () => {
        const state = await endAuction();
        
    }


    return (
        <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Botones de Acción</h1>
            <p className="text-gray-600">Presiona cualquier botón para ejecutar su acción</p>
            </div>

            {/* Message Display */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Estado Actual:</h2>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg font-mono text-sm">{message}</p>
            </div>

            {/* Buttons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Botón 1: Console Log */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Obtener estado de contrato</h3>
                <button
                    onClick={handleConsoleLog}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                    Imprimir en Consola
                </button>
                </div>
            </div>

            {/* Botón 2: Terminar Subasta */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Terminar Subasta</h3>
                <button
                    onClick={handleEndAuction}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                    Terminar Subasta
                </button>
                </div>
            </div>
            </div>

        </div>
        </div>
    )
}

export default StateAuction;