import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import type { DefaultNodeTypes, SerializedBlockNode } from "@payloadcms/richtext-lexical";
import type { CalloutBlock, ChessDiagramBlock, ChessGameBlock, ImageBlock } from "@/payload-types";
import { ImageBlockRenderer } from "./blocks/image-block.comp";
import { CalloutBlockRenderer } from "./blocks/callout-block.comp";
import { ChessDiagramBlockRenderer } from "./blocks/chess-diagram-block.comp";
import { ChessGameBlockRenderer } from "./blocks/chess-game-block.comp";
import "./rich-text-converters.css";

type ArticleBlockNode =
  | SerializedBlockNode<ImageBlock>
  | SerializedBlockNode<CalloutBlock>
  | SerializedBlockNode<ChessDiagramBlock>
  | SerializedBlockNode<ChessGameBlock>;

export const articleRichTextConverters: JSXConvertersFunction<DefaultNodeTypes | ArticleBlockNode> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  paragraph: ({ node, nodesToJSX }) => <p className="article-body__paragraph">{nodesToJSX({ nodes: node.children })}</p>,
  heading: ({ node, nodesToJSX }) => {
    const Tag = node.tag;
    return <Tag className="article-body__heading">{nodesToJSX({ nodes: node.children })}</Tag>;
  },
  list: ({ node, nodesToJSX }) => {
    const Tag = node.tag;
    return <Tag className="article-body__list">{nodesToJSX({ nodes: node.children })}</Tag>;
  },
  quote: ({ node, nodesToJSX }) => (
    <blockquote className="article-body__quote">{nodesToJSX({ nodes: node.children })}</blockquote>
  ),
  blocks: {
    imageBlock: ({ node }) => <ImageBlockRenderer {...node.fields} />,
    calloutBlock: ({ node }) => <CalloutBlockRenderer {...node.fields} />,
    chessDiagramBlock: ({ node }) => <ChessDiagramBlockRenderer {...node.fields} />,
    chessGameBlock: ({ node }) => <ChessGameBlockRenderer {...node.fields} />,
  },
});
