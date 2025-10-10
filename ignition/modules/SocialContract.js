import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SocialContractModule", (m) => {
  const socialContract = m.contract("SocialContract");

  return { socialContract };
});