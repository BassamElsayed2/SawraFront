import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { slugify } from "../../utils";
import { useLocale } from "next-intl";

const filters = [
  {
    id: 1,
    cate: "Design",
  },
  {
    id: 2,
    cate: "Travel",
  },
  {
    id: 3,
    cate: "SEO",
  },
  {
    id: 4,
    cate: "Research",
  },
];

const defaultActiveCat = slugify(filters[0].cate);

const Nav = ({ posts }) => {
  const locale = useLocale();

  // const defaultData = posts.filter(
  //   (post) => slugify(post.cate) === defaultActiveCat
  // );

  const [activeNav, setActiveNav] = useState(defaultActiveCat);
  // const [tabPostData, setTabPostData] = useState(defaultData);

  const handleChange = (e) => {
    let filterText = slugify(e.target.textContent);
    setActiveNav(filterText);

    let tempData = [];

    for (let i = 0; i < posts.length; i++) {
      const element = posts[i];
      let categories = element["cate"];

      if (slugify(categories).includes(filterText)) {
        tempData.push(element);
      }
    }

    setTabPostData(tempData);
  };

  return (
    <ul className="mainmenu">
      <li className="menu-item-has-children">
        <Link href="/">{locale === "en" ? "Home" : "الرئيسية"}</Link>
      </li>
      <li className="menu-item-has-children">
        <Link href={`/${locale}/news`}>
          {locale === "en" ? "All News" : "جميع الأخبار"}
        </Link>
      </li>

      <li className="menu-item-has-children">
        <Link href={`/${locale}/gallery`}>
          <a>{locale === "en" ? "Gallery" : "معرض الصور"}</a>
        </Link>
      </li>
      <li>
        <Link href={`/${locale}/about`}>
          <a>{locale === "en" ? "About Us" : "عنا"}</a>
        </Link>
      </li>
    </ul>
  );
};

export default Nav;
