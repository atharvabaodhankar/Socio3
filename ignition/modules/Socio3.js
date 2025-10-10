import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Socio3Module", (m) => {
  const postContract = m.contract("PostContract");
  const socialContract = m.contract("SocialContract");

  return { postContract, socialContract };
});