import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BlogPostDetail } from "@/components/blog/blog-post-detail";
import { getBlogPost } from "@/lib/blog-api";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await getBlogPost(slug);
  if (!post) return { title: "Article" };

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const { post, related } = await getBlogPost(slug);
  if (!post) notFound();

  return <BlogPostDetail post={post} related={related} />;
}
