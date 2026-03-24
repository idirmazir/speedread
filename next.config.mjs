/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['pdf-parse-new', 'tesseract.js'],
};

export default nextConfig;
