// next.config.mjs
import createMDX from '@next/mdx'

const withMDX = createMDX({
  extension: /\.mdx?$/,
  // remarkPlugins: [], rehypePlugins: []  // 필요시 여기에 추가
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
}

export default withMDX(nextConfig)
