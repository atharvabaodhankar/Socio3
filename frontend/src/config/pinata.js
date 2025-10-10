// Pinata configuration for IPFS uploads
export const PINATA_CONFIG = {
  apiKey: "5c5276b191ef0ceba1af",
  apiSecret: "bd85b37303709e165610200c547776fe728e6c1d98ca669f72875c8ac4d6b528",
  jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmMmQ1YzMxYy00ODVhLTQwYmUtYjJjZC05NmVlYzNkMmVhNmIiLCJlbWFpbCI6ImJhb2RoYW5rYXJhdGhhcnZhQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI1YzUyNzZiMTkxZWYwY2ViYTFhZiIsInNjb3BlZEtleVNlY3JldCI6ImJkODViMzczMDM3MDllMTY1NjEwMjAwYzU0Nzc3NmZlNzI4ZTZjMWQ5OGNhNjY5ZjcyODc1YzhhYzRkNmI1MjgiLCJleHAiOjE3OTE2Mzk4OTR9.LmBRszm_ZPoRS19FAWLeft9igpibpXLHpJ8bcVYTzHMnow"
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