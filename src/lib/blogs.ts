import { compileMDX } from "next-mdx-remote/rsc";
import rehypeAutolinkHedaings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug';
import Video from "@/components/Video/Video";
import CustomImage from "@/components/CustomImage/CustomImage";

type FileTree = {
    tree: [
        {
            path: string
        }
    ]
}

export async function getBlogsMeta(): Promise<Meta[] | undefined> {
    const res = await fetch('https://api.github.com/repos/monkeyK1n9/Cadix_Blogs/git/trees/main?recursive=1', {
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
            'X-Github-Api-Version': '2022-11-28'
        }
    })

    if (!res.ok) return undefined;

    const repoFileTree: FileTree = await res.json();

    const filesArray = repoFileTree.tree
        .map(obj => obj.path)
        .filter(path => path.endsWith(".mdx"))
        .map(obj => obj.split("/")[1])

    let blogs: Meta[] = [];

    for (const repoFile of filesArray) {
        const blog = await getBlogByName(repoFile);
        if (blog) {
            const { meta } = blog;
            blogs.push(meta)
        }
    }

    return blogs;
}

export async function getBlogByName(fileName: string): Promise<BlogPost | undefined> {
    const res = await fetch(`https://raw.githubusercontent.com/monkeyK1n9/Cadix_Blogs/main/posts/${fileName}`, {
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
            'X-Github-Api-Version': '2022-11-28'
        }
    })

    if (!res.ok) return undefined;

    const rawMDX = await res.text();

    if (rawMDX === '404: Not Found') return undefined;

    const { frontmatter, content } = await compileMDX<{title: string, date: string, tags: string[]}>({
        source: rawMDX,
        components: { // here we can add components to be used in the mdx files when rendered
            Video,
            CustomImage,
        },
        options: {
            parseFrontmatter: true,
            mdxOptions: {
                rehypePlugins: [
                    rehypeSlug,
                    //@ts-ignore
                    rehypeHighlight,
                    [rehypeAutolinkHedaings, {
                        behavior: 'wrap'
                    }]
                ]
            }
        }
    })

    const id = fileName.replace(/\.mdx$/, '');

    const blogPostObj: BlogPost = {
        meta: {
            id,
            title: frontmatter.title,
            date: frontmatter.date,
            tags: frontmatter.tags
        },
        content
    }

    return blogPostObj;
}