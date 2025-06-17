import Link from "next/link";
import { slugify } from "../../utils";

const WidgetTags = ({ postTag }) => {
  if (!postTag || !Array.isArray(postTag.tags) || postTag.tags.length === 0) {
    return null; // لو مفيش تاجز ما تعرضش الويجت
  }

  return (
    <div className="axil-single-widget widget widget_tag_cloud mb--30">
      <h5 className="widget-title">Tags</h5>
      <div className="tagcloud">
        {postTag.tags.map((data, index) => (
          <Link href={`/tag/${slugify(data)}`} key={index}>
            <a>{data}</a>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WidgetTags;
