import { createUserMapping } from '../services/userMappingService';
import { getUserProfile } from '../services/profileService';

// Utility function to migrate existing users to Firebase
// This can be run manually to populate Firebase with existing blockchain profiles
export const migrateExistingUsers = async (provider, userAddresses) => {
  console.log('Starting user migration to Firebase...');
  
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  for (const address of userAddresses) {
    try {
      console.log(`Migrating user: ${address}`);
      
      // Get profile from blockchain
      const profile = await getUserProfile(provider, address);
      
      if (profile && profile.exists) {
        // Create Firebase mapping
        await createUserMapping(address, profile);
        results.success++;
        console.log(`✅ Migrated: ${address}`);
      } else {
        console.log(`⏭️  Skipped (no profile): ${address}`);
      }
    } catch (error) {
      console.error(`❌ Failed to migrate ${address}:`, error);
      results.failed++;
      results.errors.push({ address, error: error.message });
    }
  }

  console.log('Migration complete:', results);
  return results;
};

// Example usage:
// import { migrateExistingUsers } from './utils/migrateUsers';
// const addresses = ['0x123...', '0x456...'];
// migrateExistingUsers(provider, addresses);