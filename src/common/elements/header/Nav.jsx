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

  const navLinks = [
    {
      href: "/menu",
      img: {
        src: "/images/link1.png",
        className: "nav-menu",
        alt: "Blogar logo",
      },
    },
    {
      href: "/branches",
      img: {
        src: "/images/link2.png",
        className: "nav-branches",
        alt: "Blogar logo",
      },
    },
    {
      href: "/",
      img: {
        src: "/images/link3.png",
        className: "nav-home",
        alt: "Blogar logo",
      },
    },
  ];

  return (
    <ul className="mainmenu">
      {navLinks.map((link, idx) => (
        <li className="menu-item-has-children" key={idx}>
          <Link href={link.href}>
            <a>
              <img className={link.img.className} src={link.img.src} alt={link.img.alt} />
            </a>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default Nav;
