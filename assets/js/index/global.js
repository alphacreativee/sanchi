export function customDropdown(root = document) {
  const dropdowns = root.querySelectorAll(
    ".dropdown-custom, .dropdown-custom-select"
  );
  if (!dropdowns.length) return;
  dropdowns.forEach((dropdown) => {
    const btnDropdown = dropdown.querySelector(".dropdown-custom-btn");
    const dropdownMenu = dropdown.querySelector(".dropdown-custom-menu");
    const dropdownItems = dropdown.querySelectorAll(".dropdown-custom-item");
    const valueSelect = dropdown.querySelector(".value-select");
    const displayText = dropdown.querySelector(".dropdown-custom-text");

    const isSelectType = dropdown.classList.contains("dropdown-custom-select");
    const hiddenInput = isSelectType
      ? dropdown.querySelector('input[type="hidden"]')
      : null;

    if (isSelectType && displayText && !dropdown.dataset.placeholder) {
      dropdown.dataset.placeholder = displayText.textContent.trim();
    }

    if (isSelectType && hiddenInput && dropdown.dataset.defaultValue) {
      const defaultItem = dropdown.querySelector(
        `.dropdown-custom-item[data-value="${dropdown.dataset.defaultValue}"]`
      );

      if (defaultItem) {
        hiddenInput.value = dropdown.dataset.defaultValue;
        if (displayText)
          displayText.textContent = defaultItem.textContent.trim();
        dropdown.classList.add("selected");
      }
    }

    if (!btnDropdown || !dropdownMenu) return;

    dropdownMenu.setAttribute("data-pointer-event", "");
    dropdownMenu.setAttribute("data-lenis-prevent", "");

    btnDropdown.addEventListener("click", function (e) {
      e.stopPropagation();
      closeAllDropdowns(dropdown);
      const isOpen = dropdownMenu.classList.toggle("dropdown--active");
      btnDropdown.classList.toggle("--active", isOpen);
      btnDropdown.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", function () {
      closeAllDropdowns();
    });

    dropdownItems.forEach((item) => {
      item.addEventListener("click", function (e) {
        e.stopPropagation();

        if (isSelectType) {
          const optionText = item.textContent.trim();
          displayText.textContent = optionText;
          if (hiddenInput) {
            hiddenInput.value = item.dataset.value || optionText;
            hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
          }
          dropdown.classList.add("selected");
          dropdown.classList.remove("is-invalid");
        } else {
          const currentImgEl = valueSelect.querySelector("img");
          const currentImg = currentImgEl ? currentImgEl.src : "";
          const currentText = valueSelect.querySelector("span").textContent;
          const clickedHtml = item.innerHTML;

          valueSelect.innerHTML = clickedHtml;

          const isSelectTime = currentText.trim() === "Time";

          if (!isSelectTime) {
            if (currentImg) {
              item.innerHTML = `<span>${currentText}</span><img src="${currentImg}" alt="" />`;
            } else {
              item.innerHTML = `<span>${currentText}</span>`;
            }
          }
        }

        closeAllDropdowns();
      });
    });

    window.addEventListener("scroll", function () {
      if (dropdownMenu.closest(".header-lang")) {
        dropdownMenu.classList.remove("dropdown--active");
        btnDropdown.classList.remove("--active");
        btnDropdown.setAttribute("aria-expanded", "false");
      }
    });
  });

  function closeAllDropdowns(exception) {
    dropdowns.forEach((dropdown) => {
      const menu = dropdown.querySelector(".dropdown-custom-menu");
      const btn = dropdown.querySelector(".dropdown-custom-btn");

      if (!exception || dropdown !== exception) {
        menu.classList.remove("dropdown--active");
        btn.classList.remove("--active");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }
}
export function headerScroll() {
  const header = document.getElementById("header");
  if (!header) return null;

  let lastScroll = 0;

  const trigger = ScrollTrigger.create({
    start: "top top",
    end: 9999,
    onUpdate: (self) => {
      const currentScroll = self.scroll();

      if (currentScroll <= 0) {
        header.classList.remove("scrolled");
      } else if (currentScroll > lastScroll) {
        // Scroll down
        header.classList.add("scrolled");
      } else {
        // Scroll up
        header.classList.remove("scrolled");
      }

      lastScroll = currentScroll;
    }
  });

  return trigger;
}

export function headerMenu() {
  const header = document.getElementById("header");
  const loadLanguageDropdown = () => {
    const mount = header?.querySelector("[data-header-lang-mount]");
    if (!mount || mount.dataset.loaded === "true") return Boolean(mount);

    mount.dataset.loaded = "true";
    fetch("./components/lang.html")
      .then((response) => {
        if (!response.ok) throw new Error("Không thể tải bộ chọn ngôn ngữ");
        return response.text();
      })
      .then((html) => {
        mount.innerHTML = html;
        customDropdown(mount);
      })
      .catch((error) => {
        delete mount.dataset.loaded;
        console.warn(error);
      });

    return true;
  };

  if (!loadLanguageDropdown() && header) {
    const headerObserver = new MutationObserver(() => {
      if (loadLanguageDropdown()) headerObserver.disconnect();
    });
    headerObserver.observe(header, { childList: true, subtree: true });
  }

  document.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-header-toggle]");
    if (!toggle) return;

    const navigation = document.getElementById("header-navigation");
    if (!navigation) return;

    const isOpen = navigation.classList.toggle("show");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Đóng menu" : "Mở menu");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    const navigation = document.getElementById("header-navigation");
    const toggle = document.querySelector("[data-header-toggle]");
    if (!navigation?.classList.contains("show") || !toggle) return;

    navigation.classList.remove("show");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Mở menu");
    toggle.focus();
  });
}

export function reservationLinkModal() {
  document.addEventListener("click", (event) => {
    const reservationLink = event.target.closest(
      'a[href="#reservationForm"]'
    );

    if (!reservationLink) return;

    event.preventDefault();

    const reservationModal = document.getElementById(
      "formReservationModal"
    );

    if (!reservationModal || typeof bootstrap === "undefined") return;

    bootstrap.Modal.getOrCreateInstance(reservationModal).show();
  });
}

export function bannerSlider() {
  const sliders = document.querySelectorAll(".banner-slider");
  if (!sliders.length || typeof Swiper === "undefined") return [];

  return Array.from(sliders).map((slider) => {
    slider.querySelectorAll(".banner-slide[data-vimeo-id]").forEach((slide) => {
      const vimeoId = slide.dataset.vimeoId?.trim();
      if (!vimeoId || slide.querySelector(".banner-video")) return;

      const video = document.createElement("div");
      const iframe = document.createElement("iframe");

      video.className = "banner-video";
      iframe.src = `https://player.vimeo.com/video/${encodeURIComponent(vimeoId)}?background=1&autoplay=1&muted=1&loop=1&autopause=0&playsinline=1&dnt=1`;
      iframe.title = slide.dataset.vimeoTitle || "Video banner Sanchi Privé";
      iframe.allow = "autoplay; fullscreen; picture-in-picture";
      iframe.setAttribute("allowfullscreen", "");
      iframe.addEventListener("load", () => video.classList.add("is-loaded"), {
        once: true
      });

      video.appendChild(iframe);
      slide.appendChild(video);
      slide.classList.add("has-vimeo");
    });

    const slides = slider.querySelectorAll(".swiper-slide");
    const prevArrow = slider.querySelector(".swiper-button-prev");
    const nextArrow = slider.querySelector(".swiper-button-next");
    const hasMultipleSlides = slides.length > 1;

    [prevArrow, nextArrow].forEach((arrow) => {
      if (arrow) arrow.hidden = !hasMultipleSlides;
    });

    const options = {
      effect: "slide",
      speed: 900,
      loop: hasMultipleSlides,
      allowTouchMove: hasMultipleSlides,
      watchOverflow: true
    };

    if (hasMultipleSlides) {
      options.navigation = {
        nextEl: nextArrow,
        prevEl: prevArrow
      };
      options.autoplay = {
        delay: 6000,
        disableOnInteraction: false
      };
    }

    return new Swiper(slider, options);
  });
}

export function sectionTreatmentSlider() {
  const sliders = document.querySelectorAll(".sectionTreatment-slider");
  if (!sliders.length || typeof Swiper === "undefined") return [];

  return Array.from(sliders).map((slider) => {
    const syncEndState = (swiper) => {
      slider.classList.toggle("is-end", swiper.isEnd);

      const section = slider.closest(".sectionTreatment");
      const sectionLeft = Math.max(
        section?.getBoundingClientRect().left || 0,
        0
      );
      const sectionRight = Math.min(
        section?.getBoundingClientRect().right || window.innerWidth,
        window.innerWidth
      );

      swiper.slides.forEach((slide) => {
        const bounds = slide.getBoundingClientRect();
        const isClippedLeft =
          bounds.left < sectionLeft - 1 && bounds.right > sectionLeft + 1;
        const isClippedRight =
          bounds.left < sectionRight - 1 && bounds.right > sectionRight + 1;

        slide.classList.toggle("is-left-preview", isClippedLeft);
        slide.classList.toggle("is-right-preview", isClippedRight);
      });
    };

    const swiper = new Swiper(slider, {
      speed: 800,
      grabCursor: true,
      loop: false,
      observer: true,
      observeParents: true,
      slidesPerView: 1.4,
      spaceBetween: 16,
      slidesOffsetAfter: 25,
      breakpoints: {
        768: {
          slidesPerView: 2.4,
          spaceBetween: 20
        },
        1200: {
          slidesPerView: 2.65,
          spaceBetween: 20
        }
      },
      on: {
        init: syncEndState,
        progress: syncEndState,
        reachEnd: syncEndState,
        fromEdge: syncEndState,
        resize: syncEndState,
        setTranslate: syncEndState,
        transitionEnd: syncEndState
      }
    });

    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartIndex = 0;
    let suppressPreviewClick = false;

    const getPointerPosition = (event) => {
      const point = event.touches?.[0] || event.changedTouches?.[0] || event;

      return {
        x: point?.clientX || 0,
        y: point?.clientY || 0
      };
    };

    slider.addEventListener(
      "pointerdown",
      (event) => {
        const point = getPointerPosition(event);
        dragStartX = point.x;
        dragStartY = point.y;
        dragStartIndex = swiper.activeIndex;
        suppressPreviewClick = false;
      },
      true
    );

    slider.addEventListener(
      "pointermove",
      (event) => {
        if (!event.buttons && event.pointerType === "mouse") return;

        const point = getPointerPosition(event);
        if (
          Math.abs(point.x - dragStartX) > 6 ||
          Math.abs(point.y - dragStartY) > 6
        ) {
          suppressPreviewClick = true;
        }
      },
      true
    );

    slider.addEventListener(
      "pointerup",
      (event) => {
        const point = getPointerPosition(event);
        const distanceX = point.x - dragStartX;
        const distanceY = point.y - dragStartY;

        if (
          Math.abs(distanceX) < 40 ||
          Math.abs(distanceX) <= Math.abs(distanceY) ||
          swiper.activeIndex !== dragStartIndex
        ) {
          return;
        }

        suppressPreviewClick = true;

        if (distanceX > 0 && !swiper.isBeginning) {
          swiper.slidePrev();
          return;
        }

        if (distanceX < 0 && !swiper.isEnd) {
          swiper.slideNext();
        }
      },
      true
    );

    slider.addEventListener("click", (event) => {
      if (suppressPreviewClick || !swiper.allowClick) {
        event.preventDefault();
        suppressPreviewClick = false;
        return;
      }

      const link = event.target.closest(".sectionTreatment-cardLink");
      const card = link?.closest(".sectionTreatment-card");
      const isPreviousPreview = card?.classList.contains("is-left-preview");
      const isNextPreview = card?.classList.contains("is-right-preview");

      if (link && isPreviousPreview && !swiper.isBeginning) {
        event.preventDefault();
        swiper.slidePrev();
        return;
      }

      if (!link || !isNextPreview || swiper.isEnd) return;

      event.preventDefault();
      swiper.slideNext();
    });

    return swiper;
  });
}

export function sectionTestimonialSlider() {
  const sliders = document.querySelectorAll(".sectionTestimonial-slider");
  if (!sliders.length || typeof Swiper === "undefined") return [];

  return Array.from(sliders).map((slider) => {
    const pagination = slider.querySelector(".sectionTestimonial-pagination");

    return new Swiper(slider, {
      speed: 700,
      autoHeight: true,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      pagination: {
        el: pagination,
        clickable: true
      }
    });
  });
}

export function offerDetailSlider() {
  const sliders = document.querySelectorAll(".offerDetail-slider");
  if (!sliders.length || typeof Swiper === "undefined") return [];

  return Array.from(sliders).map((slider) => {
    const aside = slider.closest(".inspirationDetail-aside");
    const caption = aside?.querySelector("[data-offer-caption]");
    const pagination = aside?.querySelector(".offerDetail-pagination");

    const updateCaption = (swiper) => {
      if (!caption) return;
      caption.textContent =
        swiper.slides[swiper.activeIndex]?.dataset.caption || "";
    };

    const resetProgress = () => {
      pagination
        ?.querySelectorAll(".offerDetail-progressFill")
        .forEach((fill) => {
          fill.style.transform = "scaleX(0)";
        });
    };

    return new Swiper(slider, {
      slidesPerView: 1,
      loop: true,
      speed: 700,
      effect: "slide",
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: false
      },
      pagination: {
        el: pagination,
        clickable: true,
        renderBullet(index, className) {
          return `<button class="${className}" type="button" aria-label="Chuyển đến ảnh ${index + 1}"><span class="offerDetail-progressFill"></span></button>`;
        }
      },
      on: {
        init: updateCaption,
        slideChange(swiper) {
          resetProgress();
          updateCaption(swiper);
        },
        autoplayTimeLeft(swiper, timeLeft, percentage) {
          const activeProgress = pagination?.querySelector(
            ".swiper-pagination-bullet-active .offerDetail-progressFill"
          );
          if (activeProgress) {
            activeProgress.style.transform = `scaleX(${1 - percentage})`;
          }
        }
      }
    });
  });
}

export function sectionGalleryLightbox() {
  const galleryLinks = [...document.querySelectorAll(".sectionGallery-link")];
  const lightbox = document.querySelector(".sectionGallery-lightbox");
  const swiperEl = lightbox?.querySelector(".swiper-lightbox");

  if (!galleryLinks.length || !lightbox || !swiperEl) return null;

  const titleEl = lightbox.querySelector(".swiper-slide-title");
  const closeButton = lightbox.querySelector(".icon-close-lightbox");
  let lastTrigger = null;

  const updateTitle = (swiper) => {
    if (!titleEl) return;
    titleEl.textContent =
      swiper.slides[swiper.activeIndex]?.dataset.title || "";
  };

  const swiper = new Swiper(swiperEl, {
    navigation: {
      nextEl: lightbox.querySelector(".swiper-button-next"),
      prevEl: lightbox.querySelector(".swiper-button-prev")
    },
    pagination: {
      el: lightbox.querySelector(".swiper-fraction"),
      type: "fraction"
    },
    on: {
      init: updateTitle,
      slideChange: updateTitle
    }
  });

  const openLightbox = (index, trigger) => {
    lastTrigger = trigger;
    lightbox.classList.remove("hidden");
    lightbox.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("gallery-lightbox-open");
    swiper.update();
    swiper.slideTo(index, 0);
    updateTitle(swiper);
    closeButton?.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.add("hidden");
    lightbox.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("gallery-lightbox-open");
    lastTrigger?.focus();
  };

  galleryLinks.forEach((link, index) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openLightbox(index, link);
    });
  });

  closeButton?.addEventListener("click", closeLightbox);
  lightbox
    .querySelector(".lightbox-overlay")
    ?.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.classList.contains("hidden")) {
      closeLightbox();
    }
  });

  return swiper;
}

export function formReservation() {
  const forms = document.querySelectorAll("[data-form-type]");
  if (!forms.length) return [];

  return Array.from(forms).map((form) => {
    const submitButton = form.querySelector(".formReservation-submit");
    const successMessage = form.querySelector(".formReservation-success");
    const requiredInputs = form.querySelectorAll(
      ".formReservation-input[required]"
    );
    const requiredDropdowns = form.querySelectorAll(
      ".formReservation-dropdown[data-required]"
    );
    let submitTimer = null;
    let successTimer = null;

    const hideSuccess = () => {
      if (successMessage) successMessage.hidden = true;
    };

    const resetForm = () => {
      form.reset();

      requiredInputs.forEach((input) => {
        input.classList.remove("is-invalid");
        input.lightpickInstance?.reset();
      });

      requiredDropdowns.forEach((dropdown) => {
        const hiddenInput = dropdown.querySelector('input[type="hidden"]');
        const displayText = dropdown.querySelector(".dropdown-custom-text");
        const dropdownMenu = dropdown.querySelector(".dropdown-custom-menu");
        const dropdownButton = dropdown.querySelector(".dropdown-custom-btn");
        const defaultValue = dropdown.dataset.defaultValue || "";
        const defaultItem = defaultValue
          ? dropdown.querySelector(
              `.dropdown-custom-item[data-value="${defaultValue}"]`
            )
          : null;

        if (hiddenInput) hiddenInput.value = defaultValue;
        if (displayText) {
          displayText.textContent = defaultItem
            ? defaultItem.textContent.trim()
            : dropdown.dataset.placeholder || "";
        }

        dropdown.classList.toggle("selected", Boolean(defaultItem));
        dropdown.classList.remove("is-invalid");
        dropdownMenu?.classList.remove("dropdown--active");
        dropdownButton?.classList.remove("--active");
      });
    };

    const showSuccessModal = () => {
      const successModalElement = document.getElementById(
        "formReservationSuccessModal"
      );
      resetForm();

      if (!successModalElement || typeof bootstrap === "undefined") {
        if (successMessage) {
          successMessage.hidden = false;
          successTimer = window.setTimeout(() => {
            successMessage.hidden = true;
          }, 5000);
        }
        return;
      }

      const openSuccessModal = () => {
        bootstrap.Modal.getOrCreateInstance(successModalElement).show();
      };
      const currentModal = form.closest(".modal.show");

      if (currentModal && currentModal !== successModalElement) {
        currentModal.addEventListener("hidden.bs.modal", openSuccessModal, {
          once: true
        });
        bootstrap.Modal.getOrCreateInstance(currentModal).hide();
        return;
      }

      openSuccessModal();
    };

    requiredInputs.forEach((input) => {
      input.addEventListener("input", () => {
        input.classList.remove("is-invalid");
        hideSuccess();
      });
    });

    requiredDropdowns.forEach((dropdown) => {
      const hiddenInput = dropdown.querySelector('input[type="hidden"]');
      hiddenInput?.addEventListener("change", hideSuccess);
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!submitButton || submitButton.classList.contains("loading")) return;

      window.clearTimeout(successTimer);
      hideSuccess();
      let isValid = true;
      let firstInvalidControl = null;

      requiredInputs.forEach((input) => {
        const isEmpty = !input.value.trim();
        input.classList.toggle("is-invalid", isEmpty);
        if (isEmpty) {
          isValid = false;
          firstInvalidControl ||= input;
        }
      });

      requiredDropdowns.forEach((dropdown) => {
        const hiddenInput = dropdown.querySelector('input[type="hidden"]');
        const isEmpty = !hiddenInput?.value.trim();
        dropdown.classList.toggle("is-invalid", isEmpty);
        if (isEmpty) {
          isValid = false;
          firstInvalidControl ||= dropdown.querySelector(
            ".dropdown-custom-btn"
          );
        }
      });

      if (!isValid) {
        firstInvalidControl?.focus();
        return;
      }

      submitButton.classList.add("loading");
      submitButton.disabled = true;

      window.clearTimeout(submitTimer);
      submitTimer = window.setTimeout(() => {
        submitButton.classList.remove("loading");
        submitButton.disabled = false;
        showSuccessModal();
      }, 3000);
    });

    return form;
  });
}

/////// thêm class select-tab vào thì vẫn filter theo đúng type đó, không show hết item.
// export function createFilterTab() {
//   document.querySelectorAll(".filter-section").forEach((section) => {
//     let result;

//     const targetSelector = section.dataset.target;
//     if (targetSelector) {
//       result = document.querySelector(targetSelector);
//     } else {
//       result = section.querySelector(".filter-section-result");
//       if (!result) {
//         result = section.nextElementSibling;
//         if (!result?.classList.contains("filter-section-result")) return;
//       }
//     }

//     if (!result) return;
//     //check select tab
//     const isSelectTab = section.classList.contains("select-tab");
//     const buttons = section.querySelectorAll(".filter-button[data-type]");

//     const activeBtn = section.querySelector(".filter-button.active");
//     if (activeBtn) {
//       const activeType = activeBtn.dataset.type;
//       if (activeType !== "all") {
//         result.querySelectorAll(".filter-item").forEach((item) => {
//           item.style.display = item.classList.contains(activeType)
//             ? ""
//             : "none";
//         });
//       }
//     }

//     buttons.forEach((btn) => {
//       btn.addEventListener("click", function () {
//         section
//           .querySelectorAll(".filter-button")
//           .forEach((b) => b.classList.remove("active"));
//         this.classList.add("active");

//         const type = this.dataset.type;
//         const items = result.querySelectorAll(".filter-item");

//         gsap
//           .timeline()
//           .to(result, { autoAlpha: 0, duration: 0.3 })
//           .call(() => {
//             items.forEach((item) => {
//               // Nếu là select-tab thì không có trường hợp "all" → luôn filter theo type
//               if (!isSelectTab && type === "all") {
//                 item.style.display = "";
//               } else {
//                 item.style.display = item.classList.contains(type)
//                   ? ""
//                   : "none";
//               }
//             });
//           })
//           .to(result, { autoAlpha: 1, duration: 0.3 });
//       });
//     });
//   });
// }
// export function createFilterTab() {
//   document.querySelectorAll(".filter-section").forEach((section) => {
//     let result;

//     const targetSelector = section.dataset.target;
//     if (targetSelector) {
//       result = document.querySelector(targetSelector);
//     } else {
//       result = section.querySelector(".filter-section-result");
//       if (!result) {
//         result = section.nextElementSibling;
//         if (!result?.classList.contains("filter-section-result")) return;
//       }
//     }

//     if (!result) return;

//     const isSelectTab = section.classList.contains("select-tab");
//     const buttons = section.querySelectorAll(".filter-button[data-type]");
//     const mobileToggle = section.querySelector(".filter-mobile-toggle");
//     const mobileLabel = section.querySelector(".filter-mobile-label");

//     const closeMobileFilter = () => {
//       section.classList.remove("is-open");
//       mobileToggle?.setAttribute("aria-expanded", "false");
//     };

//     if (mobileToggle) {
//       mobileToggle.addEventListener("click", (event) => {
//         event.stopPropagation();
//         const isOpen = section.classList.toggle("is-open");
//         mobileToggle.setAttribute("aria-expanded", String(isOpen));
//       });

//       document.addEventListener("click", (event) => {
//         if (!section.contains(event.target)) closeMobileFilter();
//       });

//       section.addEventListener("keydown", (event) => {
//         if (event.key === "Escape") closeMobileFilter();
//       });
//     }

//     const applyFilter = (type) => {
//       const items = result.querySelectorAll(".filter-item");

//       items.forEach((item) => {
//         let show;
//         if (type === "all") {
//           show = isSelectTab ? item.classList.contains("all") : true;
//         } else {
//           show = item.classList.contains(type);
//         }
//         item.style.display = show ? "" : "none";
//       });

//       items.forEach((item) => {
//         if (item.style.display === "none") return;

//         const sliderEl = item.querySelector(".accommodations-slider");
//         if (sliderEl) reinitAccommodationSlider(sliderEl);
//       });
//     };

//     const activeBtn = section.querySelector(".filter-button.active");
//     if (activeBtn) {
//       if (mobileLabel) mobileLabel.textContent = activeBtn.textContent.trim();
//       const activeType = activeBtn.dataset.type;
//       if (activeType !== "all" || isSelectTab) {
//         applyFilter(activeType);
//       }
//     }

//     buttons.forEach((btn) => {
//       btn.addEventListener("click", function () {
//         section
//           .querySelectorAll(".filter-button")
//           .forEach((b) => b.classList.remove("active"));
//         this.classList.add("active");

//         if (mobileLabel) mobileLabel.textContent = this.textContent.trim();
//         closeMobileFilter();

//         const type = this.dataset.type;

//         gsap
//           .timeline()
//           .to(result, { autoAlpha: 0, duration: 0.3 })
//           .call(() => {
//             applyFilter(type);
//           })
//           .to(result, { autoAlpha: 1, duration: 0.3 })
//           .call(() => {
//             ScrollTrigger.refresh();
//           });
//       });
//     });
//   });
// }
export function createFilterTab() {
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll(".filter-section").forEach((section) => {
    let result;

    const targetSelector = section.dataset.target;
    if (targetSelector) {
      result = document.querySelector(targetSelector);
    } else {
      result = section.querySelector(".filter-section-result");
      if (!result) {
        result = section.nextElementSibling;
        if (!result?.classList.contains("filter-section-result")) return;
      }
    }

    if (!result) return;

    const isSelectTab = section.classList.contains("select-tab");
    const isAnimationTab = section.classList.contains("animation-tab");
    const buttons = section.querySelectorAll(".filter-button[data-type]");
    const mobileToggle = section.querySelector(".filter-mobile-toggle");
    const mobileLabel = section.querySelector(".filter-mobile-label");

    const closeMobileFilter = () => {
      section.classList.remove("is-open");
      mobileToggle?.setAttribute("aria-expanded", "false");
    };

    if (mobileToggle) {
      mobileToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpen = section.classList.toggle("is-open");
        mobileToggle.setAttribute("aria-expanded", String(isOpen));
      });

      document.addEventListener("click", (event) => {
        if (!section.contains(event.target)) closeMobileFilter();
      });

      section.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMobileFilter();
      });
    }

    const applyFilter = (type) => {
      const items = result.querySelectorAll(".filter-item");

      items.forEach((item) => {
        let show;
        if (type === "all") {
          show = isSelectTab ? item.classList.contains("all") : true;
        } else {
          show = item.classList.contains(type);
        }
        item.style.display = show ? "" : "none";
      });

      items.forEach((item) => {
        if (item.style.display === "none") return;

        const sliderEl = item.querySelector(".accommodations-slider");
        if (sliderEl) reinitAccommodationSlider(sliderEl);
      });
    };

    const getVisibleRevealBoxes = () => {
      const visibleItems = [...result.querySelectorAll(".filter-item")].filter(
        (item) => item.style.display !== "none"
      );
      return visibleItems.flatMap((item) => [
        ...item.querySelectorAll(".reveal-element-item")
      ]);
    };

    // Set trạng thái ẩn ban đầu — gọi ngay sau applyFilter, lúc result còn vô hình
    const prepareFilterImagesState = () => {
      if (!isAnimationTab) return;

      getVisibleRevealBoxes().forEach((box) => {
        const overlay = box.querySelector(".reveal-overlay");
        const media = box.querySelector("img, video");
        if (!overlay || !media) return;

        gsap.set(overlay, {
          scaleY: 0,
          transformOrigin: "top",
          overwrite: "auto"
        });
        gsap.set(media, { opacity: 0, scale: 1.05, overwrite: "auto" });
      });
    };

    // Chạy animation reveal cho 1 box
    const revealBox = (box) => {
      const overlay = box.querySelector(".reveal-overlay");
      const media = box.querySelector("img, video");
      if (!overlay || !media) return;

      gsap
        .timeline()
        .to(overlay, {
          scaleY: 1,
          transformOrigin: "top",
          duration: 0.5,
          ease: "power2.out"
        })
        .to(overlay, {
          scaleY: 0,
          transformOrigin: "bottom",
          duration: 0.5,
          ease: "power2.inOut"
        })
        .set(media, { opacity: 1 }, 0.5)
        .to(media, { scale: 1, duration: 0.6, ease: "none" }, 0.5);
    };

    // Chỉ chạy ngay cho box đang trong viewport; box ngoài viewport đợi cuộn tới mới chạy
    const playFilterImagesReveal = () => {
      if (!isAnimationTab) return;

      const boxes = getVisibleRevealBoxes();
      const viewportLimit = window.innerHeight * 0.85;

      // Huỷ ScrollTrigger cũ (nếu có) gắn trên các box này, tránh chồng trigger qua nhiều lần filter
      boxes.forEach((box) => {
        if (box._revealST) {
          box._revealST.kill();
          box._revealST = null;
        }
      });

      let inViewIndex = 0; // đếm riêng cho stagger của các box đang hiện ngay

      boxes.forEach((box) => {
        const rect = box.getBoundingClientRect();
        const isInViewport = rect.top < viewportLimit && rect.bottom > 0;

        if (isInViewport) {
          const i = inViewIndex++;
          gsap.delayedCall(i * 0.06, () => revealBox(box));
        } else {
          box._revealST = ScrollTrigger.create({
            trigger: box,
            start: "top 85%",
            once: true,
            onEnter: () => revealBox(box)
          });
        }
      });
    };

    const activeBtn = section.querySelector(".filter-button.active");
    if (activeBtn) {
      if (mobileLabel) mobileLabel.textContent = activeBtn.textContent.trim();
      const activeType = activeBtn.dataset.type;
      if (activeType !== "all" || isSelectTab) {
        applyFilter(activeType);
      }
    }

    // Chạy reveal cho trạng thái filter ban đầu (khi vừa load trang)
    if (isAnimationTab) {
      prepareFilterImagesState();
      playFilterImagesReveal();
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", function () {
        section
          .querySelectorAll(".filter-button")
          .forEach((b) => b.classList.remove("active"));
        this.classList.add("active");

        if (mobileLabel) mobileLabel.textContent = this.textContent.trim();
        closeMobileFilter();

        const type = this.dataset.type;

        gsap
          .timeline()
          .to(result, { autoAlpha: 0, duration: 0.3 })
          .call(() => {
            applyFilter(type);
            prepareFilterImagesState();
          })
          .to(result, { autoAlpha: 1, duration: 0.3 })
          .call(() => {
            playFilterImagesReveal();
            ScrollTrigger.refresh();
          });
      });
    });
  });
}
export function getDateLightPick() {
  const datepickers = document.querySelectorAll("[data-lightpick]");
  if (!datepickers.length || typeof Lightpick === "undefined") return [];

  return Array.from(datepickers).map((datepicker) => {
    const picker = new Lightpick({
      field: datepicker,
      minDate: new Date(),
      singleDate: true,
      numberOfMonths: 1,
      format: "DD/MM/YYYY",
      orientation: "auto",
      onSelect: (date) => {
        if (!date) return;
        datepicker.value = date.format("DD/MM/YYYY");
        datepicker.classList.remove("is-invalid");
        datepicker.dispatchEvent(new Event("input", { bubbles: true }));
        datepicker.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    datepicker.lightpickInstance = picker;
    return picker;
  });
}
export function revealAnimationBox() {
  gsap.registerPlugin(ScrollTrigger);

  const elements = document.querySelectorAll(".reveal-element");

  elements.forEach((element) => {
    if (element.dataset.revealInitialized) return;
    element.dataset.revealInitialized = true;

    const overlay = element.querySelector(".reveal-overlay");
    const media = element.querySelector("img, video");

    if (!overlay || !media) return;

    gsap.set(overlay, { scaleY: 0, transformOrigin: "top" });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        once: true
        // markers: true,
      }
    });

    tl.to(overlay, {
      scaleY: 1,
      transformOrigin: "top",
      duration: 0.8,
      ease: "power2.out"
    })
      .to(
        overlay,
        {
          scaleY: 0,
          transformOrigin: "bottom",
          duration: 0.6,
          ease: "power2.inOut"
        },
        ">"
      )
      .set(media, { opacity: 1 }, 0.8)
      .to(media, { scale: 1, duration: 0.7, ease: "power2.out" }, 0.8);
  });
}

export function fadeInOnScroll() {
  const elements = document.querySelectorAll("[data-fade-in]");
  if (
    !elements.length ||
    typeof gsap === "undefined" ||
    typeof ScrollTrigger === "undefined"
  ) {
    return [];
  }

  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  return Array.from(elements).map((element) => {
    if (element.dataset.fadeInitialized) return null;
    element.dataset.fadeInitialized = "true";

    if (reduceMotion) {
      gsap.set(element, { clearProps: "opacity,transform,visibility" });
      return null;
    }

    const delay = Number.parseFloat(element.dataset.fadeDelay) || 0;
    const bounds = element.getBoundingClientRect();
    const visibleTop = Math.max(bounds.top, 0);
    const visibleBottom = Math.min(bounds.bottom, window.innerHeight);
    const visibleHeight = Math.max(visibleBottom - visibleTop, 0);
    const visibleRatio = bounds.height > 0 ? visibleHeight / bounds.height : 0;
    const isWithinInitialViewport = visibleRatio >= 0.7;

    const animation = {
      autoAlpha: 1,
      y: 0,
      duration: 0.4,
      delay,
      ease: "power2.out"
    };

    if (isWithinInitialViewport) {
      return gsap.to(element, animation);
    }

    return gsap.to(element, {
      ...animation,
      scrollTrigger: {
        trigger: element,
        start: "top 70%",
        once: true
      }
    });
  });
}

export function parallaxImagesOnScroll() {
  const images = document.querySelectorAll("[data-parallax-image]");
  if (
    !images.length ||
    typeof gsap === "undefined" ||
    typeof ScrollTrigger === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return [];
  }

  gsap.registerPlugin(ScrollTrigger);

  return Array.from(images).map((image) => {
    if (image.dataset.parallaxInitialized) return null;
    image.dataset.parallaxInitialized = "true";

    return gsap.fromTo(
      image,
      { yPercent: 10 },
      {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: image.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );
  });
}

export function bannerContentFadeIn() {
  const contents = document.querySelectorAll(".banner-content");
  if (!contents.length) return null;
  const loadingElement = document.querySelector(".loading");
  let hasPlayed = false;

  const play = (delay = 0) => {
    if (hasPlayed) return null;
    hasPlayed = true;

    if (typeof gsap === "undefined") {
      contents.forEach((content) => {
        content.style.opacity = "1";
        content.style.visibility = "visible";
        content.style.transform = "none";
      });
      return null;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(contents, { autoAlpha: 1, y: 0 });
      return null;
    }

    return gsap.to(contents, {
      autoAlpha: 1,
      y: 0,
      duration: 0.5,
      delay,
      ease: "power2.out"
    });
  };

  const start = () => {
    const loadingComplete =
      document.documentElement.dataset.loadingComplete === "true" ||
      loadingElement?.hidden;

    if (loadingElement && !loadingComplete) {
      window.addEventListener("pageLoadingComplete", () => play(0.1), {
        once: true
      });
      return null;
    }

    return play();
  };

  if (document.readyState === "complete") return start();

  window.addEventListener("load", start, { once: true });
  return null;
}

export function menuFlipbook() {
  if (document.documentElement.dataset.menuFlipbookEvents === "true") return;
  document.documentElement.dataset.menuFlipbookEvents = "true";

  let audioContext = null;

  const playPageSound = (enabled) => {
    if (!enabled) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    audioContext ||= new AudioContextClass();
    if (audioContext.state === "suspended") audioContext.resume();

    const duration = 0.13;
    const frameCount = Math.floor(audioContext.sampleRate * duration);
    const buffer = audioContext.createBuffer(
      1,
      frameCount,
      audioContext.sampleRate
    );
    const channel = buffer.getChannelData(0);

    for (let index = 0; index < frameCount; index += 1) {
      const progress = index / frameCount;
      channel[index] = (Math.random() * 2 - 1) * (1 - progress);
    }

    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();

    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(0.055, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration
    );

    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    source.start();
  };

  const initViewer = (viewer) => {
    if (!viewer || viewer.dataset.menuInitialized === "true") return;
    viewer.dataset.menuInitialized = "true";

    const filters = [...viewer.querySelectorAll("[data-menu-filter]")];
    const groups = [...viewer.querySelectorAll("[data-menu-group]")];
    const filterWrap = viewer.querySelector(".menuModal-filterWrap");
    const filterToggle = viewer.querySelector("[data-menu-filter-toggle]");
    const filterLabel = viewer.querySelector("[data-menu-filter-label]");
    const prevButton = viewer.querySelector("[data-menu-prev]");
    const nextButton = viewer.querySelector("[data-menu-next]");
    const soundButton = viewer.querySelector("[data-menu-sound]");
    const downloadButton = viewer.querySelector("[data-menu-download]");
    const fullscreenButton = viewer.querySelector("[data-menu-fullscreen]");
    const fullscreenRoot = viewer.querySelector("[data-menu-fullscreen-root]");
    const zoomStage = viewer.querySelector(".menuFlipbook-stage");
    const currentLabel = viewer.querySelector("[data-menu-current]");
    const totalLabel = viewer.querySelector("[data-menu-total]");
    const mobileFullscreenMedia = window.matchMedia(
      "(max-width: 767px), (hover: none) and (pointer: coarse)"
    );

    let activeGroup = groups.find((group) =>
      group.classList.contains("is-active")
    );
    let soundEnabled = true;
    let zoomScale = 1;
    let zoomX = 0;
    let zoomY = 0;
    let pinchStartDistance = 0;
    let pinchStartScale = 1;
    let pinchStartX = 0;
    let pinchStartY = 0;
    let pinchStartCenter = null;
    let panStart = null;
    let redrawFrame = 0;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const getTouchDistance = (touches) =>
      Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
      );

    const getTouchCenter = (touches) => ({
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    });

    const applyZoom = () => {
      if (!zoomStage || !activeGroup) return;

      const maxX = (zoomStage.clientWidth * (zoomScale - 1)) / 2;
      const maxY = (zoomStage.clientHeight * (zoomScale - 1)) / 2;
      zoomX = clamp(zoomX, -maxX, maxX);
      zoomY = clamp(zoomY, -maxY, maxY);

      activeGroup.style.transform = `translate3d(${zoomX}px, ${zoomY}px, 0) scale(${zoomScale})`;
      zoomStage.classList.toggle("is-zoomed", zoomScale > 1.001);
    };

    const resetZoom = (group = activeGroup) => {
      zoomScale = 1;
      zoomX = 0;
      zoomY = 0;
      pinchStartDistance = 0;
      pinchStartCenter = null;
      panStart = null;
      if (group) group.style.transform = "";
      zoomStage?.classList.remove("is-zoomed", "is-panning");
    };

    const redrawActiveFlipbook = () => {
      window.cancelAnimationFrame(redrawFrame);
      redrawFrame = window.requestAnimationFrame(() => {
        redrawFrame = window.requestAnimationFrame(() => {
          const pageFlip = activeGroup?._menuPageFlip;
          pageFlip?.update();
          if (pageFlip) updateCounter(pageFlip.getCurrentPageIndex());
        });
      });
    };

    const setPseudoFullscreen = (isActive, isMobile = false) => {
      if (!fullscreenRoot) return;
      fullscreenRoot.classList.toggle("is-menu-fullscreen", isActive);
      fullscreenRoot.classList.toggle(
        "is-menu-mobile-fullscreen",
        isActive && isMobile
      );
      document.body.classList.toggle("menu-page-fullscreen", isActive);
      document.body.classList.toggle(
        "menu-page-mobile-fullscreen",
        isActive && isMobile
      );
      fullscreenButton?.setAttribute("aria-pressed", String(isActive));
      fullscreenButton?.setAttribute(
        "aria-label",
        isActive ? "Thu nhỏ menu" : "Phóng to menu"
      );
      if (!isActive) resetZoom();
      redrawActiveFlipbook();
    };

    const closeMobileFilter = () => {
      filterWrap?.classList.remove("is-open");
      filterToggle?.setAttribute("aria-expanded", "false");
    };

    filterToggle?.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = filterWrap?.classList.toggle("is-open") || false;
      filterToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (event) => {
      if (!filterWrap?.contains(event.target)) closeMobileFilter();
    });

    if (zoomStage) {
      zoomStage.addEventListener(
        "touchstart",
        (event) => {
          if (event.touches.length >= 2) {
            event.preventDefault();
            event.stopPropagation();
            pinchStartDistance = getTouchDistance(event.touches);
            pinchStartScale = zoomScale;
            pinchStartX = zoomX;
            pinchStartY = zoomY;
            pinchStartCenter = getTouchCenter(event.touches);
            panStart = null;
            return;
          }

          if (zoomScale > 1.001 && event.touches.length === 1) {
            event.preventDefault();
            event.stopPropagation();
            const touch = event.touches[0];
            panStart = {
              x: touch.clientX,
              y: touch.clientY,
              offsetX: zoomX,
              offsetY: zoomY
            };
            zoomStage.classList.add("is-panning");
          }
        },
        { passive: false, capture: true }
      );

      zoomStage.addEventListener(
        "touchmove",
        (event) => {
          if (
            event.touches.length >= 2 &&
            pinchStartDistance > 0 &&
            pinchStartCenter
          ) {
            event.preventDefault();
            event.stopPropagation();
            const distance = getTouchDistance(event.touches);
            const center = getTouchCenter(event.touches);
            zoomScale = clamp(
              pinchStartScale * (distance / pinchStartDistance),
              1,
              3
            );
            zoomX = pinchStartX + center.x - pinchStartCenter.x;
            zoomY = pinchStartY + center.y - pinchStartCenter.y;
            applyZoom();
            return;
          }

          if (zoomScale > 1.001 && event.touches.length === 1 && panStart) {
            event.preventDefault();
            event.stopPropagation();
            const touch = event.touches[0];
            zoomX = panStart.offsetX + touch.clientX - panStart.x;
            zoomY = panStart.offsetY + touch.clientY - panStart.y;
            applyZoom();
          }
        },
        { passive: false, capture: true }
      );

      zoomStage.addEventListener(
        "touchend",
        (event) => {
          if (zoomScale > 1.001 || pinchStartDistance > 0) {
            event.stopPropagation();
          }
          if (event.touches.length < 2) {
            pinchStartDistance = 0;
            pinchStartCenter = null;
          }
          if (!event.touches.length) {
            panStart = null;
            zoomStage.classList.remove("is-panning");
          }
          if (zoomScale <= 1.02) resetZoom();
        },
        { capture: true }
      );
    }

    const updateDownload = () => {
      if (!downloadButton || !activeGroup) return;
      downloadButton.href = activeGroup.dataset.menuPdf || "#";
      downloadButton.download =
        activeGroup.dataset.menuFile || "menu-sanchi-prive.pdf";
    };

    const updateCounter = (pageIndex = 0) => {
      const pageCount = activeGroup?._menuPageCount || 0;
      const pageFlip = activeGroup?._menuPageFlip;
      const isLandscape = pageFlip?.getOrientation?.() === "landscape";
      const lastPageIndex = isLandscape
        ? Math.max(0, pageCount - (pageCount % 2 === 0 ? 2 : 1))
        : Math.max(0, pageCount - 1);
      const displayedPage = isLandscape
        ? Math.min(pageIndex + 2, pageCount)
        : pageIndex + 1;

      if (currentLabel) {
        currentLabel.textContent = String(displayedPage).padStart(2, "0");
      }
      if (totalLabel) {
        totalLabel.textContent = pageCount
          ? String(pageCount).padStart(2, "0")
          : "--";
      }

      if (prevButton) prevButton.disabled = !pageCount || pageIndex <= 0;
      if (nextButton) {
        nextButton.disabled = !pageCount || pageIndex >= lastPageIndex;
      }
    };

    const initGroup = async (group) => {
      if (!group) return null;
      if (group._menuPageFlip) return group._menuPageFlip;
      if (group._menuLoadPromise) return group._menuLoadPromise;

      const loading = group.querySelector("[data-menu-loading]");
      const book = group.querySelector(".menuFlipbook-book");
      const source = group.dataset.menuPdf;

      group.classList.add("is-loading");
      if (loading) loading.hidden = false;
      updateCounter(0);

      group._menuLoadPromise = (async () => {
        if (!window.pdfjsLib || !window.St?.PageFlip) {
          throw new Error("Thiếu thư viện PDF.js hoặc StPageFlip");
        }
        if (!source || !book) throw new Error("Chưa thiết lập file PDF menu");

        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "./assets/libs/pdf.worker.min.js";

        const pdf = await window.pdfjsLib.getDocument(source).promise;
        const firstPage = await pdf.getPage(1);
        const firstViewport = firstPage.getViewport({ scale: 1 });
        const pageElements = await Promise.all(
          Array.from({ length: pdf.numPages }, async (_, index) => {
            const pdfPage = await pdf.getPage(index + 1);
            const viewport = pdfPage.getViewport({ scale: 1.5 });
            const pageElement = document.createElement("div");
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d", { alpha: false });

            pageElement.className = "menuFlipbook-page";
            pageElement.setAttribute("data-density", "soft");
            pageElement.setAttribute(
              "aria-label",
              `Trang ${index + 1} / ${pdf.numPages}`
            );
            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);
            canvas.setAttribute("aria-hidden", "true");
            pageElement.appendChild(canvas);

            await pdfPage.render({ canvasContext: context, viewport }).promise;
            return pageElement;
          })
        );

        book.replaceChildren(...pageElements);
        const pageFlip = new window.St.PageFlip(book, {
          width: Math.round(firstViewport.width),
          height: Math.round(firstViewport.height),
          size: "stretch",
          minWidth: 260,
          maxWidth: 850,
          minHeight: 346,
          maxHeight: 1134,
          maxShadowOpacity: 0.38,
          // Keep the first and last spreads at the same geometry as the
          // remaining pages. Hard cover mode changes to a single-page spread
          // at both ends and makes the book visibly jump while turning.
          showCover: false,
          drawShadow: true,
          flippingTime: 900,
          useMouseEvents: true,
          mobileScrollSupport: false,
          clickEventForward: true,
          autoSize: true
        });

        let isInteractive = false;
        pageFlip.on("init", () => {
          isInteractive = true;
        });
        pageFlip.on("flip", (event) => {
          if (group === activeGroup) updateCounter(event.data);
          if (isInteractive) playPageSound(soundEnabled);
        });
        pageFlip.on("changeOrientation", () => {
          if (group === activeGroup) {
            updateCounter(pageFlip.getCurrentPageIndex());
          }
        });
        pageFlip.loadFromHTML(pageElements);

        group._menuPageFlip = pageFlip;
        group._menuPageCount = pdf.numPages;
        group.classList.remove("is-loading");
        group.classList.add("is-ready");
        if (loading) loading.hidden = true;

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            pageFlip.update();
            if (group === activeGroup) {
              updateCounter(pageFlip.getCurrentPageIndex());
            }
          });
        });
        return pageFlip;
      })().catch((error) => {
        group.classList.remove("is-loading");
        group.classList.add("is-error");
        if (loading) {
          loading.classList.add("is-error");
          loading.setAttribute("aria-label", "Không thể tải menu PDF");
        }
        console.warn("Không thể khởi tạo flipbook.", error);
        updateCounter(0);
        return null;
      });

      return group._menuLoadPromise;
    };

    const turnPage = (direction) => {
      const pageFlip = activeGroup?._menuPageFlip;
      if (!pageFlip) return;

      if (direction === "prev") pageFlip.flipPrev();
      if (direction === "next") pageFlip.flipNext();
    };

    filters.forEach((filter) => {
      filter.addEventListener("click", () => {
        if (filterLabel) filterLabel.textContent = filter.textContent.trim();
        closeMobileFilter();

        const target = filter.dataset.menuFilter;
        const nextGroup = groups.find(
          (group) => group.dataset.menuGroup === target
        );
        if (!nextGroup || nextGroup === activeGroup) return;

        resetZoom(activeGroup);

        filters.forEach((item) => {
          const isActive = item === filter;
          item.classList.toggle("is-active", isActive);
          item.setAttribute("aria-selected", String(isActive));
        });

        groups.forEach((group) => {
          const isActive = group === nextGroup;
          group.classList.toggle("is-active", isActive);
          group.hidden = !isActive;
        });

        activeGroup = nextGroup;
        updateDownload();
        updateCounter(nextGroup._menuPageFlip?.getCurrentPageIndex() || 0);
        initGroup(nextGroup).then(() => {
          window.dispatchEvent(new Event("resize"));
        });
      });
    });

    prevButton?.addEventListener("click", () => turnPage("prev"));
    nextButton?.addEventListener("click", () => turnPage("next"));

    soundButton?.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      soundButton.classList.toggle("is-active", soundEnabled);
      soundButton.setAttribute("aria-pressed", String(soundEnabled));
      soundButton.setAttribute(
        "aria-label",
        soundEnabled ? "Tắt âm thanh lật trang" : "Bật âm thanh lật trang"
      );
    });

    fullscreenButton?.addEventListener("click", async () => {
      if (fullscreenRoot?.classList.contains("is-menu-fullscreen")) {
        setPseudoFullscreen(false);
        return;
      }

      try {
        if (mobileFullscreenMedia.matches) {
          setPseudoFullscreen(true, true);
        } else if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else if (
          document.fullscreenEnabled &&
          fullscreenRoot?.requestFullscreen
        ) {
          await fullscreenRoot?.requestFullscreen();
        } else {
          setPseudoFullscreen(true);
        }
      } catch (error) {
        setPseudoFullscreen(true);
      }
    });

    document.addEventListener("fullscreenchange", () => {
      const isFullscreen =
        document.fullscreenElement === fullscreenRoot ||
        fullscreenRoot?.classList.contains("is-menu-fullscreen");
      fullscreenButton?.setAttribute("aria-pressed", String(isFullscreen));
      fullscreenButton?.setAttribute(
        "aria-label",
        isFullscreen ? "Thoát toàn màn hình" : "Xem toàn màn hình"
      );
      redrawActiveFlipbook();
    });

    window.visualViewport?.addEventListener("resize", () => {
      if (fullscreenRoot?.classList.contains("is-menu-fullscreen")) {
        redrawActiveFlipbook();
      }
    });

    viewer.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") turnPage("prev");
      if (event.key === "ArrowRight") turnPage("next");
      if (event.key === "Escape") {
        closeMobileFilter();
        if (fullscreenRoot?.classList.contains("is-menu-fullscreen")) {
          setPseudoFullscreen(false);
        }
      }
    });

    updateDownload();
    updateCounter(0);
    initGroup(activeGroup);
  };

  initViewer(document.querySelector("[data-menu-page]"));
}

export function loading() {
  const loadingElement = document.querySelector(".loading");
  if (!loadingElement) return;
  const loadingLogo = loadingElement.querySelector(".logo");

  const hideLoading = () => {
    loadingElement.hidden = true;
    loadingElement.classList.add("d-none");
    document.documentElement.dataset.loadingComplete = "true";
    window.dispatchEvent(new Event("pageLoadingComplete"));
  };

  const completeLoading = () => {
    if (
      typeof gsap === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      hideLoading();
      return;
    }

    const timeline = gsap.timeline({ onComplete: hideLoading });

    if (loadingLogo) {
      timeline.fromTo(
        loadingLogo,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.6,
          ease: "power2.inOut"
        }
      );
    }

    timeline.fromTo(
      loadingElement,
      { clipPath: "inset(0% 0% 0% 0%)" },
      {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.8,
        ease: "power2.inOut"
      }
    );
  };

  if (document.readyState === "complete") {
    completeLoading();
    return;
  }

  window.addEventListener("load", completeLoading, { once: true });
}
