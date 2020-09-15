<template>
  <div class="layer-manager">
    <div class="cp-preloader cp-preloader_type1">
      <span class="cp-preloader__letter" data-preloader="L">L</span>
      <span class="cp-preloader__letter" data-preloader="O">O</span>
      <span class="cp-preloader__letter" data-preloader="A">A</span>
      <span class="cp-preloader__letter" data-preloader="D">D</span>
      <span class="cp-preloader__letter" data-preloader="I">I</span>
      <span class="cp-preloader__letter" data-preloader="N">N</span>
      <span class="cp-preloader__letter" data-preloader="G">G</span>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style>
.cp-preloader {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 999;
  -webkit-transform: translate3d(-50%, -50%, 0);
  transform: translate3d(-50%, -50%, 0);
}

.cp-preloader__letter {
  display: inline-block;
  position: relative;
  overflow: hidden;
  color: rgba(0, 0, 0, 0.3);
}

.cp-preloader__letter:before {
  content: attr(data-preloader);
  position: absolute;
  top: 0;
  left: 0;

  -webkit-animation-duration: 3s;

  animation-duration: 3s;
  -webkit-animation-iteration-count: infinite;
  animation-iteration-count: infinite;
  -webkit-animation-fill-mode: backwards;
  animation-fill-mode: backwards;
}

.cp-preloader__letter:nth-child(2):before {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}

.cp-preloader__letter:nth-child(3):before {
  -webkit-animation-delay: 0.45s;
  animation-delay: 0.45s;
}

.cp-preloader__letter:nth-child(4):before {
  -webkit-animation-delay: 0.6s;
  animation-delay: 0.6s;
}

.cp-preloader__letter:nth-child(5):before {
  -webkit-animation-delay: 0.75s;
  animation-delay: 0.75s;
}

.cp-preloader__letter:nth-child(6):before {
  -webkit-animation-delay: 0.9s;
  animation-delay: 0.9s;
}

.cp-preloader__letter:nth-child(7):before {
  -webkit-animation-delay: 1.05s;
  animation-delay: 1.05s;
}

/* type 1 */

.cp-preloader_type1 .cp-preloader__letter:before {
  -webkit-animation-name: cp-preloader1;
  animation-name: cp-preloader1;
}

@-webkit-keyframes cp-preloader1 {
  0%,
  100% {
    -webkit-transform: rotateY(-90deg);
    transform: rotateY(-90deg);
    opacity: 0;
  }

  20%,
  50% {
    -webkit-transform: rotateY(0);
    transform: rotateY(0);
    opacity: 1;
  }

  65% {
    -webkit-transform: rotateY(0);
    transform: rotateY(0);
    opacity: 0.3;
  }

  80% {
    opacity: 0;
  }
}

@keyframes cp-preloader1 {
  0%,
  100% {
    -webkit-transform: rotateY(-90deg);
    transform: rotateY(-90deg);
    opacity: 0;
  }

  20%,
  50% {
    -webkit-transform: rotateY(0);
    transform: rotateY(0);
    opacity: 1;
  }

  65% {
    -webkit-transform: rotateY(0);
    transform: rotateY(0);
    opacity: 0.3;
  }

  80% {
    opacity: 0;
  }
}
</style>
