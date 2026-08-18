/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["ethers", "@solana/web3.js", "bs58", "tweetnacl"],
};

export default nextConfig;
