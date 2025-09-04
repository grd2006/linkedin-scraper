/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      os: false,
      fs: false,
      path: false,
    };
    return config;
  },
};

export default nextConfig;

[
    {
        "type": "command",
        "details": {
            "key": "workbench.action.files.newFile"
        }
    }
]
