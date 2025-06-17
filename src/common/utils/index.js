import React, { useEffect } from "react";
import { DateTime } from "luxon";

const slugify = function (text) {
  if (!text) return "";
  return text
    .toString()
    .normalize("NFD") // فصل التشكيل والحروف المركبة
    .replace(/[\u0300-\u036f]/g, "") // إزالة التشكيل
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

function removeDuplicates(originalArray, prop) {
  const lookupObject = {};
  originalArray.forEach((item) => {
    lookupObject[item[prop]] = item;
  });
  return Object.values(lookupObject);
}

const SortingByDate = function (posts) {
  return posts.sort((post1, post2) => {
    const beforeDate = DateTime.fromFormat(post1.date, "LLL dd yyyy");
    const afterDate = DateTime.fromFormat(post2.date, "LLL dd yyyy");
    return afterDate - beforeDate; // نزولياً من الأحدث للأقدم
  });
};

function filterPostsByActiveNav(postData, activeNav) {
  if (!postData || !Array.isArray(postData)) return [];
  return postData.filter((post) => {
    const slug = slugify(post.status);

    return slug === activeNav;
  });
}

function extractCategories(postData) {
  if (!postData || !Array.isArray(postData)) return [];
  const extracted = [
    ...new Set(
      postData
        .map((post) => {
          return post.status;
        })
        .filter(Boolean)
    ),
  ];
  return extracted;
}

const HoverActiveClass = function (hoverRef) {
  useEffect(() => {
    if (!hoverRef.current) return;

    const refContainer = Array.from(hoverRef.current.childNodes);

    function onMouseEnter() {
      refContainer.forEach((e) => {
        const div = e.querySelector(".content-block");
        if (div) {
          div.classList.add("axil-control");
          div.classList.remove("is-active");
        }
      });
      const currentDiv = this.querySelector(".content-block");
      if (currentDiv) {
        currentDiv.classList.add("is-active");
      }
    }

    refContainer.forEach((f) => {
      f.addEventListener("mouseenter", onMouseEnter);
    });

    // Cleanup لإزالة الـ event listeners عند فك المكون
    return () => {
      refContainer.forEach((f) => {
        f.removeEventListener("mouseenter", onMouseEnter);
      });
    };
  }, [hoverRef]);
};

export {
  slugify,
  removeDuplicates,
  SortingByDate,
  filterPostsByActiveNav,
  extractCategories,
  HoverActiveClass,
};
