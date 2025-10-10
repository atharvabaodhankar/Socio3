import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PostContractModule", (m) => {
  const postContract = m.contract("PostContract");

  return { postContract };
});