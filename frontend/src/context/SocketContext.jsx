import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveVitals, setLiveVitals] = useState({
    patientId: 1,
    patientName: "Rahul Verma",
    disease: "Heart Disease",
    heartRate: 88,
    spO2: 96,
    bp: "135/85",
    glucose: 145,
    timestamp: new Date().toISOString(),
  });
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(2);

  useEffect(() => {
    // Establish WebSocket connection to backend for authenticated sessions
    const socketInstance = io("http://localhost:5000", {
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketInstance.on("connect", () => {
      console.log("⚡ Connected to HealthForecast AI WebSocket Server");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("🔌 Disconnected from WebSocket Server");
      setIsConnected(false);
    });

    // Listen for live vitals telemetry updates
    socketInstance.on("vitals_update", (data) => {
      setLiveVitals(data);
    });

    // Listen for threshold breach alerts (Quiet for routine warnings, bottom-right toast for Critical emergencies)
    socketInstance.on("alert_breach", (alertData) => {
      console.log("🚨 Breach Alert Received via WebSocket:", alertData);

      // Prepend to live alert feed & update bell badge counter
      setLiveAlerts((prev) => [alertData, ...prev.slice(0, 19)]);
      setUnreadCount((prev) => prev + 1);

      // Only trigger bottom-right toast popup for CRITICAL Emergency Events (severe BP spike, SpO2 drop)
      if (alertData.severity === "Critical") {
        toast.error(`🚨 CRITICAL EMERGENCY ALERT: ${alertData.patient}`, {
          description: alertData.message,
          duration: 4000,
        });
      }
    });

    setSocket(socketInstance);

    // On session logout / unmount: disconnect socket
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        liveVitals,
        liveAlerts,
        unreadCount,
        resetUnreadCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
