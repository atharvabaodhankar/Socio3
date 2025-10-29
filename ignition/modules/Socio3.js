const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Socio3Module", (m) => {
  const postContract = m.contract("PostContract");
  const socialContract = m.contract("SocialContract");
  const profileContract = m.contract("ProfileContract");

  return { postContract, socialContract, profileContract };
});