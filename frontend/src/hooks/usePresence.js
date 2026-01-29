import { useEffect } from 'react';
import { updateUserPresence, setUserOffline } from '../services/firebaseService';

export const usePresence = (userAddress) => {
    useEffect(() => {
        if (!userAddress) return;

        // Set user as online when component mounts
        updateUserPresence(userAddress);

        // Set up heartbeat interval (every 60 seconds)
        const heartbeatInterval = setInterval(() => {
            updateUserPresence(userAddress);
        }, 60000); // 1 minute

        // Set user as offline when component unmounts or window closes
        const handleBeforeUnload = () => {
            setUserOffline(userAddress);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup
        return () => {
            clearInterval(heartbeatInterval);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            setUserOffline(userAddress);
        };
    }, [userAddress]);
};
