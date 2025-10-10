// Pinata configuration for IPFS uploads
export const PINATA_CONFIG = {
  apiKey: import.meta.env.VITE_PINATA_API_KEY,
  apiSecret: import.meta.env.VITE_PINATA_API_SECRET,
  jwt: import.meta.env.VITE_PINATA_JWT
};

export const uploadToPinata = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: `socio3-${Date.now()}`,
      keyvalues: {
        app: 'socio3',
        timestamp: Date.now().toString()
      }
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_CONFIG.jwt}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      ipfsHash: result.IpfsHash,
      pinSize: result.PinSize,
      timestamp: result.Timestamp
    };
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getIPFSUrl = (hash) => {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};