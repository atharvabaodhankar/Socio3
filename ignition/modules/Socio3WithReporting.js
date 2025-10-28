const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Socio3WithReporting", (m) => {
  // Deploy PostContract with reporting functionality
  const postContract = m.contract("PostContract");
  
  // Deploy SocialContract
  const socialContract = m.contract("SocialContract");

  return { postContract, socialContract };
});