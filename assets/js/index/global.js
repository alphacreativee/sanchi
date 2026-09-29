export function customDropdown() {
  const dropdowns = document.querySelectorAll(
    ".dropdown-custom, .dropdown-custom-select",
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
        `.dropdown-custom-item[data-value="${dropdown.dataset.defaultValue}"]`,
      );

      if (defaultItem) {
        hiddenInput.value = dropdown.dataset.defaultValue;
        if (displayText) displayText.textContent = defaultItem.textContent.trim();
        dropdown.classList.add("selected");
      }
    }

    if (!btnDropdown || !dropdownMenu) return;

    dropdownMenu.setAttribute("data-pointer-event", "");
    dropdownMenu.setAttribute("data-lenis-prevent", "");

    btnDropdown.addEventListener("click", function (e) {
      e.stopPropagation();
      closeAllDropdowns(dropdown);
      dropdownMenu.classList.toggle("dropdown--active");
      btnDropdown.classList.toggle("--active");
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
    },
  });

  return trigger;
}

export function headerMenu() {
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

export function bannerSlider() {
  const sliders = document.querySelectorAll(".banner-slider");
  if (!sliders.length || typeof Swiper === "undefined") return [];

  return Array.from(sliders).map((slider) => {
    const slides = slider.querySelectorAll(".swiper-slide");
    const prevArrow = slider.querySelector(".swiper-button-prev");
    const nextArrow = slider.querySelector(".swiper-button-next");
    const hasMultipleSlides = slides.length > 1;

    [prevArrow, nextArrow].forEach((arrow) => {
      if (arrow) arrow.hidden = !hasMultipleSlides;
    });

    const options = {
      effect: "fade",
      fadeEffect: {
        crossFade: true,
      },
      speed: 900,
      loop: hasMultipleSlides,
      allowTouchMove: hasMultipleSlides,
      watchOverflow: true,
    };

    if (hasMultipleSlides) {
      options.navigation = {
        nextEl: nextArrow,
        prevEl: prevArrow,
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
        0,
      );

      swiper.slides.forEach((slide) => {
        const bounds = slide.getBoundingClientRect();
        const isClippedLeft =
          bounds.left < sectionLeft - 1 && bounds.right > sectionLeft + 1;

        slide.classList.toggle("is-left-preview", isClippedLeft);
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
          spaceBetween: 20,
        },
        1200: {
          slidesPerView: 2.65,
          spaceBetween: 20,
        },
      },
      on: {
        init: syncEndState,
        progress: syncEndState,
        reachEnd: syncEndState,
        fromEdge: syncEndState,
        resize: syncEndState,
        setTranslate: syncEndState,
        transitionEnd: syncEndState,
      },
    });

    slider.addEventListener("click", (event) => {
      const link = event.target.closest(".sectionTreatment-cardLink");
      const card = link?.closest(".sectionTreatment-card");
      const isPreviousPreview = card?.classList.contains("is-left-preview");

      if (link && isPreviousPreview && !swiper.isBeginning) {
        event.preventDefault();
        swiper.slidePrev();
        return;
      }

      if (!window.matchMedia("(min-width: 1200px)").matches) return;

      const isNextPreview =
        card?.previousElementSibling?.classList.contains("swiper-slide-next");

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
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: pagination,
        clickable: true,
      },
    });
  });
}

export function sectionGalleryLightbox() {
  const galleryLinks = document.querySelectorAll(".sectionGallery-link");
  if (!galleryLinks.length || typeof GLightbox === "undefined") return null;

  return GLightbox({
    selector: ".sectionGallery-link",
    touchNavigation: true,
    keyboardNavigation: true,
    closeOnOutsideClick: true,
    loop: true,
    zoomable: true,
    openEffect: "zoom",
    closeEffect: "zoom",
    slideEffect: "fade",
  });
}

export function formReservation() {
  const forms = document.querySelectorAll("[data-form-type]");
  if (!forms.length) return [];

  return Array.from(forms).map((form) => {
    const submitButton = form.querySelector(".formReservation-submit");
    const successMessage = form.querySelector(".formReservation-success");
    const requiredInputs = form.querySelectorAll(
      ".formReservation-input[required]",
    );
    const requiredDropdowns = form.querySelectorAll(
      ".formReservation-dropdown[data-required]",
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
              `.dropdown-custom-item[data-value="${defaultValue}"]`,
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
        "formReservationSuccessModal",
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
          once: true,
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
            ".dropdown-custom-btn",
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
        (item) => item.style.display !== "none",
      );
      return visibleItems.flatMap((item) => [
        ...item.querySelectorAll(".reveal-element-item"),
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
          scaleX: 0,
          transformOrigin: "left",
          overwrite: "auto",
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
          scaleX: 1,
          transformOrigin: "left",
          duration: 0.5,
          ease: "power2.out",
        })
        .to(overlay, {
          scaleX: 0,
          transformOrigin: "right",
          duration: 0.5,
          ease: "power2.inOut",
        })
        .to(
          media,
          { opacity: 1, scale: 1, duration: 0.8, ease: "none" },
          "-=0.3",
        );
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
            onEnter: () => revealBox(box),
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
      },
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

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        once: true,
        // markers: true,
      },
    });

    tl.to(overlay, {
      scaleX: 1,
      transformOrigin: "left",
      duration: 0.8,
      ease: "power2.out",
    })
      .to(
        overlay,
        {
          scaleX: 0,
          transformOrigin: "right",
          duration: 0.6,
          ease: "power2.inOut",
        },
        "+=0.1",
      )
      .to(
        media,
        { opacity: 1, scale: 1, duration: 1, ease: "power2.out" },
        "-=0.4",
      );
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
    "(prefers-reduced-motion: reduce)",
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
      ease: "power2.out",
    };

    if (isWithinInitialViewport) {
      return gsap.to(element, animation);
    }

    return gsap.to(element, {
      ...animation,
      scrollTrigger: {
        trigger: element,
        start: "top 70%",
        once: true,
      },
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
          scrub: true,
        },
      },
    );
  });
}

export function bannerContentFadeIn() {
  const contents = document.querySelectorAll(".banner-content");
  if (!contents.length) return null;

  const play = () => {
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
      duration: 0.4,
      ease: "power2.out",
    });
  };

  if (document.readyState === "complete") return play();

  window.addEventListener("load", play, { once: true });
  return null;
}
