(function () {
  var sectionIds = ['menu', 'find-us', 'story'];
  var sections = sectionIds
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  if (!sections.length || !('IntersectionObserver' in window)) return;

  var links = document.querySelectorAll('.navlinks a');

  function setActive(id) {
    links.forEach(function (link) {
      var isMatch = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', isMatch);
      if (isMatch) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
})();
