// Pinata configuration for IPFS uploads
export const PINATA_CONFIG = {
  apiKey: import.meta.env.VITE_PINATA_API_KEY,
  apiSecret: import.meta.env.VITE_PINATA_API_SECRET,
  jwt: import.meta.env.VITE_PINATA_JWT
};

export const uploadToPinata = async (file, caption = '') => {
  try {
    // First upload the image file
    const imageFormData = new FormData();
    imageFormData.append('file', file);

    const imageMetadata = JSON.stringify({
      name: `socio3-image-${Date.now()}`,
      keyvalues: {
        app: 'socio3',
        type: 'image',
        timestamp: Date.now().toString()
      }
    });
    imageFormData.append('pinataMetadata', imageMetadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    imageFormData.append('pinataOptions', options);

    const imageResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_CONFIG.apiKey,
        'pinata_secret_api_key': PINATA_CONFIG.apiSecret
      },
      body: imageFormData
    });

    if (!imageResponse.ok) {
      throw new Error(`HTTP error! status: ${imageResponse.status}`);
    }

    const imageResult = await imageResponse.json();
    
    // Create metadata JSON with image hash and caption
    const postMetadata = {
      name: `Socio3 Post - ${Date.now()}`,
      description: caption,
      image: `ipfs://${imageResult.IpfsHash}`,
      imageUrl: getIPFSUrl(imageResult.IpfsHash),
      caption: caption,
      timestamp: Date.now(),
      app: 'socio3'
    };

    // Upload metadata JSON
    const metadataBlob = new Blob([JSON.stringify(postMetadata, null, 2)], {
      type: 'application/json'
    });

    const metadataFormData = new FormData();
    metadataFormData.append('file', metadataBlob, 'metadata.json');

    const metadataMetadata = JSON.stringify({
      name: `socio3-metadata-${Date.now()}`,
      keyvalues: {
        app: 'socio3',
        type: 'metadata',
        timestamp: Date.now().toString()
      }
    });
    metadataFormData.append('pinataMetadata', metadataMetadata);
    metadataFormData.append('pinataOptions', options);

    const metadataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_CONFIG.apiKey,
        'pinata_secret_api_key': PINATA_CONFIG.apiSecret
      },
      body: metadataFormData
    });

    if (!metadataResponse.ok) {
      throw new Error(`Metadata upload failed! status: ${metadataResponse.status}`);
    }

    const metadataResult = await metadataResponse.json();

    return {
      success: true,
      ipfsHash: metadataResult.IpfsHash, // This is the metadata hash that goes to blockchain
      imageHash: imageResult.IpfsHash,
      pinSize: metadataResult.PinSize,
      timestamp: metadataResult.Timestamp,
      metadata: postMetadata
    };
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const unpinFile = async (hash) => {
  try {
    const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${hash}`, {
      method: 'DELETE',
      headers: {
        'pinata_api_key': PINATA_CONFIG.apiKey,
        'pinata_secret_api_key': PINATA_CONFIG.apiSecret
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to unpin file: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error unpinning file:', error);
    return false;
  }
};

// Function to fetch metadata from IPFS
export const fetchPostMetadata = async (metadataHash) => {
  try {
    const response = await fetchFromIPFS(metadataHash);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }
    
    // Check content type to determine if it's metadata JSON or a direct image
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.startsWith('image/')) {
      // This is a direct image file (old format)
      return {
        isDirectImage: true,
        imageUrl: getIPFSUrl(metadataHash),
        caption: '',
        description: ''
      };
    }
    
    // Try to parse as JSON (new metadata format)
    const text = await response.text();
    
    // Check if it looks like JSON
    if (text.trim().startsWith('{')) {
      try {
        const metadata = JSON.parse(text);
        return {
          ...metadata,
          isDirectImage: false
        };
      } catch (parseError) {
        console.warn('Failed to parse as JSON, treating as direct image');
      }
    }
    
    // Fallback: treat as direct image
    return {
      isDirectImage: true,
      imageUrl: getIPFSUrl(metadataHash),
      caption: '',
      description: ''
    };
    
  } catch (error) {
    console.error('Error fetching post metadata:', error);
    // Return fallback for direct image
    return {
      isDirectImage: true,
      imageUrl: getIPFSUrl(metadataHash),
      caption: '',
      description: ''
    };
  }
};

export const getIPFSUrl = (hash) => {
  // Use Pinata gateway for better reliability
  const gatewayUrl = import.meta.env.VITE_PINATA_GATEWAY_URL;
  const gatewayToken = import.meta.env.VITE_PINATA_GATEWAY_TOKEN;
  
  if (gatewayUrl && gatewayToken) {
    // Ensure the gateway URL has the protocol and add gateway token
    const fullGatewayUrl = gatewayUrl.startsWith('http') ? gatewayUrl : `https://${gatewayUrl}`;
    return `${fullGatewayUrl}/ipfs/${hash}?pinataGatewayToken=${gatewayToken}`;
  }
  // Fallback to public gateway
  return `https://ipfs.io/ipfs/${hash}`;
};

// Helper function to fetch from IPFS with authentication
export const fetchFromIPFS = async (hash) => {
  const gatewayUrl = import.meta.env.VITE_PINATA_GATEWAY_URL;
  const gatewayToken = import.meta.env.VITE_PINATA_GATEWAY_TOKEN;
  
  if (gatewayUrl && gatewayToken) {
    // Use authenticated Pinata gateway with query parameter
    const fullGatewayUrl = gatewayUrl.startsWith('http') ? gatewayUrl : `https://${gatewayUrl}`;
    const url = `${fullGatewayUrl}/ipfs/${hash}?pinataGatewayToken=${gatewayToken}`;
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.warn('Pinata gateway failed, falling back to public gateway:', error);
    }
  }
  
  // Fallback to public gateway
  const publicUrl = `https://ipfs.io/ipfs/${hash}`;
  return fetch(publicUrl);
};