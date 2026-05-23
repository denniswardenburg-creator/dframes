(function () {
  const data = window.DFRAMES_DATA || { years: [] };
  const body = document.body;
  const basePath = body.dataset.basePath || "";
  const page = body.dataset.page || "home";
  let lightboxPhotos = [];
  let lightboxIndex = 0;

  const resolve = (path) => {
    if (!path) return "";
    if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
    return `${basePath}${path}`.replace(/\/{2,}/g, "/").replace(":/", "://");
  };

  const allSubjects = () => data.years.flatMap((year) =>
    year.subjects.map((subject) => ({ ...subject, year: year.year }))
  );

  const findSubject = (yearValue, slug) => allSubjects().find((subject) =>
    String(subject.year) === String(yearValue) && subject.slug === slug
  );

  const setActiveClass = (element, isActive) => {
    if (isActive) {
      element.classList.add("is-active");
      element.setAttribute("aria-current", "page");
      return;
    }
    element.classList.remove("is-active");
    element.removeAttribute("aria-current");
  };

  const renderNavigation = () => {
    document.querySelectorAll("[data-nav-years]").forEach((nav) => {
      nav.innerHTML = "";
      data.years.forEach((yearBlock) => {
        const item = document.createElement("li");
        item.className = "nav-year";

        const yearLabel = document.createElement("div");
        yearLabel.className = "nav-year__label";
        yearLabel.textContent = yearBlock.year;
        item.append(yearLabel);

        const subjects = document.createElement("ul");
        subjects.className = "nav-subjects";

        yearBlock.subjects.forEach((subject) => {
          const subjectItem = document.createElement("li");
          const link = document.createElement("a");
          link.href = resolve(subject.url);
          link.textContent = subject.title;
          setActiveClass(
            link,
            page === "gallery" &&
              String(body.dataset.year) === String(yearBlock.year) &&
              body.dataset.subject === subject.slug
          );
          subjectItem.append(link);
          subjects.append(subjectItem);
        });

        item.append(subjects);
        nav.append(item);
      });
    });
  };

  const renderCurrentYear = () => {
    document.querySelectorAll("[data-current-year]").forEach((element) => {
      element.textContent = String(new Date().getFullYear());
    });
  };

  const renderSeries = () => {
    const grid = document.querySelector("[data-series-grid]");
    if (!grid) return;

    grid.innerHTML = "";
    allSubjects().forEach((subject) => {
      const card = document.createElement("a");
      card.className = "series-card";
      card.href = resolve(subject.url);
      card.innerHTML = `
        <span class="series-card__year">${subject.year}</span>
        <strong>${subject.title}</strong>
        <span>${subject.summary || ""}</span>
      `;
      grid.append(card);
    });
  };

  const renderHomeCarousel = () => {
    const carousel = document.querySelector("[data-home-carousel]");
    if (!carousel) return;

    const subject = findSubject("2026", "ijsland") || allSubjects()[0];
    const photos = subject?.photos || [];

    if (!photos.length) {
      carousel.innerHTML = `
        <div class="empty-gallery">
          <strong>IJsland</strong>
          <span>De eerste selectie wordt binnenkort toegevoegd.</span>
        </div>
      `;
      return;
    }

    carousel.innerHTML = `
      <button class="carousel-button carousel-button--prev" type="button" data-carousel-prev aria-label="Vorige foto">&lsaquo;</button>
      <div class="carousel-viewport">
        <div class="carousel-track" data-carousel-track></div>
      </div>
      <button class="carousel-button carousel-button--next" type="button" data-carousel-next aria-label="Volgende foto">&rsaquo;</button>
      <div class="carousel-dots" data-carousel-dots aria-label="Carrousel navigatie"></div>
    `;

    const track = carousel.querySelector("[data-carousel-track]");
    const dots = carousel.querySelector("[data-carousel-dots]");
    let activeIndex = 0;
    let timerId;

    photos.forEach((photo, index) => {
      const slide = document.createElement("button");
      slide.className = "carousel-slide protected-media";
      slide.type = "button";
      slide.dataset.lightboxIndex = String(index);
      slide.setAttribute("aria-label", `${photo.title || "Foto"} openen`);
      slide.innerHTML = `
        <img src="${resolve(photo.src)}" alt="${photo.alt || photo.title || ""}" draggable="false">
        <span class="carousel-caption">${photo.title || ""}</span>
      `;
      track.append(slide);

      const dot = document.createElement("button");
      dot.className = "carousel-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Toon foto ${index + 1}`);
      dot.addEventListener("click", () => setSlide(index, true));
      dots.append(dot);
    });

    const setSlide = (index, manual = false) => {
      activeIndex = (index + photos.length) % photos.length;
      track.style.transform = `translateX(${-activeIndex * 100}%)`;
      dots.querySelectorAll(".carousel-dot").forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
      if (manual) restartTimer();
    };

    const nextSlide = () => setSlide(activeIndex + 1);
    const restartTimer = () => {
      clearInterval(timerId);
      timerId = setInterval(nextSlide, 5000);
    };

    carousel.querySelector("[data-carousel-prev]").addEventListener("click", () => setSlide(activeIndex - 1, true));
    carousel.querySelector("[data-carousel-next]").addEventListener("click", () => setSlide(activeIndex + 1, true));
    track.addEventListener("click", (event) => {
      const slide = event.target.closest("[data-lightbox-index]");
      if (!slide) return;
      const index = Number(slide.dataset.lightboxIndex);
      openLightbox(photos[index], photos, index);
    });
    carousel.addEventListener("mouseenter", () => clearInterval(timerId));
    carousel.addEventListener("mouseleave", restartTimer);

    setSlide(0);
    restartTimer();
    protectMedia(carousel);
  };

  const protectMedia = (scope = document) => {
    scope.querySelectorAll("img").forEach((image) => {
      image.setAttribute("draggable", "false");
      image.addEventListener("dragstart", (event) => event.preventDefault());
    });

    scope.querySelectorAll(".protected-media, .gallery-grid, .lightbox").forEach((element) => {
      ["contextmenu", "dragstart", "selectstart", "copy"].forEach((eventName) => {
        element.addEventListener(eventName, (event) => event.preventDefault());
      });
    });
  };

  const createPhotoButton = (photo, index) => {
    const button = document.createElement("button");
    button.className = "photo-card protected-media";
    button.type = "button";
    button.dataset.photoIndex = String(index);
    button.setAttribute("aria-label", photo.title || `Foto ${index + 1}`);

    const image = document.createElement("img");
    image.src = resolve(photo.src);
    image.alt = photo.alt || photo.title || "";
    image.loading = "lazy";
    image.decoding = "async";
    image.draggable = false;

    const guard = document.createElement("span");
    guard.className = "photo-card__guard";
    guard.setAttribute("aria-hidden", "true");

    const caption = document.createElement("span");
    caption.className = "photo-card__caption";
    caption.textContent = photo.title || "";

    button.append(image, guard, caption);
    return button;
  };

  const renderGallery = () => {
    const grid = document.querySelector("[data-gallery-grid]");
    if (!grid) return;

    const subject = findSubject(body.dataset.year, body.dataset.subject);
    const photos = subject?.photos || [];
    const count = document.querySelector("[data-gallery-count]");
    if (count) count.textContent = photos.length === 1 ? "1 foto" : `${photos.length} foto's`;

    grid.innerHTML = "";
    if (!photos.length) {
      const empty = document.createElement("div");
      empty.className = "empty-gallery";
      empty.innerHTML = `
        <strong>Deze serie wordt binnenkort aangevuld.</strong>
        <span>De pagina en fotoweergave staan alvast klaar.</span>
      `;
      grid.append(empty);
      return;
    }

    photos.forEach((photo, index) => grid.append(createPhotoButton(photo, index)));
    grid.addEventListener("click", (event) => {
      const card = event.target.closest("[data-photo-index]");
      if (!card) return;
      const index = Number(card.dataset.photoIndex);
      openLightbox(photos[index], photos, index);
    });
    protectMedia(grid);
  };

  const updateLightbox = () => {
    const lightbox = document.querySelector("[data-lightbox]");
    const image = document.querySelector("[data-lightbox-image]");
    const caption = document.querySelector("[data-lightbox-caption]");
    const prev = document.querySelector("[data-lightbox-prev]");
    const next = document.querySelector("[data-lightbox-next]");
    const photo = lightboxPhotos[lightboxIndex];
    if (!lightbox || !image || !photo) return;

    image.src = resolve(photo.src);
    image.alt = photo.alt || photo.title || "";
    caption.textContent = photo.title || "";
    [prev, next].forEach((button) => {
      if (!button) return;
      button.hidden = lightboxPhotos.length <= 1;
    });
  };

  const openLightbox = (photo, photos = [], index = 0) => {
    const lightbox = document.querySelector("[data-lightbox]");
    if (!lightbox || !photo) return;

    lightboxPhotos = photos.length ? photos : [photo];
    lightboxIndex = Math.max(0, Math.min(index, lightboxPhotos.length - 1));
    updateLightbox();
    lightbox.hidden = false;
    document.body.classList.add("has-lightbox");
    protectMedia(lightbox);
  };

  const changeLightboxPhoto = (direction) => {
    const lightbox = document.querySelector("[data-lightbox]");
    if (!lightbox || lightbox.hidden || lightboxPhotos.length <= 1) return;

    lightboxIndex = (lightboxIndex + direction + lightboxPhotos.length) % lightboxPhotos.length;
    updateLightbox();
  };

  const closeLightbox = () => {
    const lightbox = document.querySelector("[data-lightbox]");
    const image = document.querySelector("[data-lightbox-image]");
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    if (image) image.src = "";
    document.body.classList.remove("has-lightbox");
  };

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") changeLightboxPhoto(-1);
    if (event.key === "ArrowRight") changeLightboxPhoto(1);
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
    }
  });

  document.querySelectorAll("[data-lightbox-prev]").forEach((button) => {
    button.addEventListener("click", () => changeLightboxPhoto(-1));
  });

  document.querySelectorAll("[data-lightbox-next]").forEach((button) => {
    button.addEventListener("click", () => changeLightboxPhoto(1));
  });

  document.querySelectorAll("[data-lightbox-close]").forEach((button) => {
    button.addEventListener("click", closeLightbox);
  });

  renderNavigation();
  renderCurrentYear();
  renderSeries();
  renderHomeCarousel();
  renderGallery();
  protectMedia();
})();
