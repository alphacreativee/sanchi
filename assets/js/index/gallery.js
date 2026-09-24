function galleryTabLightbox() {
  const section = document.querySelector(".gallery");
  if (!section) return;

  const lightbox = document.querySelector(".gallery-lightbox");
  if (!lightbox) return;

  const swiperEl = lightbox.querySelector(".swiper-lightbox");
  const titleEl = lightbox.querySelector(
    ".swiper-nav-inner .swiper-slide-title",
  );
  const fractionEl = lightbox.querySelector(".swiper-fraction");
  let swiperLightbox = null;

  function updateTitle(swiper) {
    if (!titleEl) return;
    const realSlides = swiperEl.querySelectorAll(
      ".swiper-slide:not(.swiper-slide-duplicate)",
    );
    const title = realSlides[swiper.realIndex]?.dataset?.title || "";

    titleEl.style.transition = "none";
    titleEl.style.transform = "translateY(20px)";
    titleEl.style.opacity = "0";
    titleEl.offsetHeight;
    titleEl.style.transition = "transform 0.4s ease, opacity 0.4s ease";
    titleEl.style.transform = "translateY(0)";
    titleEl.style.opacity = "1";
    titleEl.textContent = title;
  }

  // Collect all boxes across all visible filter-items
  function getVisibleBoxes(activeType) {
    let visibleItems;
    if (activeType === "all") {
      visibleItems = [...section.querySelectorAll(".filter-item")];
    } else {
      visibleItems = [
        ...section.querySelectorAll(`.filter-item.${activeType}`),
      ];
    }

    // Flatten: lấy tất cả .box bên trong các filter-item visible
    return visibleItems.flatMap((item) => [
      ...item.querySelectorAll(".filter-item-box"),
    ]);
  }

  function buildSlides(boxes) {
    const wrapper = swiperEl.querySelector(".swiper-wrapper");
    wrapper.innerHTML = "";

    boxes.forEach((box) => {
      const picture = box.querySelector("picture");
      const img = box.querySelector("img");
      // Lấy title từ alt của img
      const title = img?.getAttribute("alt") || "";
      // Lấy src từ img (fallback nếu không có picture)
      const src = img?.getAttribute("src") || "";
      // Lấy srcset mobile nếu có
      const mobileSrc =
        picture?.querySelector("source")?.getAttribute("srcset") || src;

      const slide = document.createElement("div");
      slide.className = "swiper-slide overflow-hidden";
      slide.dataset.title = title;
      slide.innerHTML = `
        <div class="image">
          <picture>
            <source media="(max-width: 767px)" srcset="${mobileSrc}" />
            <img src="${src}" alt="${title}" />
          </picture>
        </div>`;
      wrapper.appendChild(slide);
    });
  }

  function destroySwiper() {
    if (swiperLightbox) {
      swiperLightbox.destroy(true, true);
      swiperLightbox = null;
    }
  }

  function initSwiper() {
    swiperLightbox = new Swiper(swiperEl, {
      navigation: {
        nextEl: lightbox.querySelector(".swiper-button-next"),
        prevEl: lightbox.querySelector(".swiper-button-prev"),
      },
      pagination: {
        el: fractionEl,
        type: "fraction",
      },
      on: {
        init(swiper) {
          updateTitle(swiper);
        },
        slideChange(swiper) {
          updateTitle(swiper);
        },
      },
    });
  }

  // Click vào từng .box thay vì .filter-item
  section.querySelectorAll(".filter-item .filter-item-box").forEach((box) => {
    box.addEventListener("click", function () {
      const activeBtn = section.querySelector(".filter-button.active");
      const activeType = activeBtn?.dataset?.type || "all";

      const visibleBoxes = getVisibleBoxes(activeType);
      const index = visibleBoxes.indexOf(this);

      destroySwiper();
      buildSlides(visibleBoxes);

      lightbox.classList.remove("hidden");
      initSwiper();
      swiperLightbox.slideTo(index, 0);
      updateTitle(swiperLightbox);
    });
  });

  lightbox
    .querySelector(".icon-close-lightbox")
    ?.addEventListener("click", () => {
      lightbox.classList.add("hidden");
    });

  lightbox.querySelector(".lightbox-overlay")?.addEventListener("click", () => {
    lightbox.classList.add("hidden");
  });
}
galleryTabLightbox();
