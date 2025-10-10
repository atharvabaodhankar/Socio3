const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ProfileContract", (m) => {
  const profileContract = m.contract("ProfileContract");

  return { profileContract };
});