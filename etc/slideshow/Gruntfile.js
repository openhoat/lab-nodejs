module.exports = function(grunt) {
  const path = require('path')
  const fs = require('fs')
  const _ = require('lodash')
  const revealJsBaseDir = path.join(__dirname, 'node_modules/reveal.js')
  const port = grunt.option('port') || 8000
  const base = grunt.option('base') || '../../docs'

  grunt.initConfig({
    pkg: require(path.join(revealJsBaseDir, 'package')),
    clean: [`${base}/*`],
    copy: {
      reveal: {
        files: [{
          expand: true,
          cwd: path.join(revealJsBaseDir),
          src: ['css/print/**', 'js/reveal.js', 'lib/**', 'plugin/**'],
          dest: `${base}/`,
        }, {
          expand: true,
          src: ['assets/**', 'lib/**', 'plugin/**'],
          dest: `${base}/`,
        }, {
          expand: true,
          cwd: 'slides',
          src: ['**'],
          dest: `${base}/slides/`,
        }]
      },
      slideshow: {
        files: [{
          expand: true,
          cwd: '.',
          src: ['index.html'],
          dest: `${base}/`
        }],
        options: {
          processContent: content => {
            const slideshow = grunt.config.get('slides')
            const data = {_, slideshow}
            return grunt.template.process(content, {data})
          }
        },
      }
    },
    uglify: {
      build: {
        src: path.join(revealJsBaseDir, 'js/reveal.js'),
        dest: `${base}/js/reveal.min.js`,
      }
    },
    sass: {
      core: {
        files: {
          [base + '/css/reveal.css']: path.join(revealJsBaseDir, 'css/reveal.scss'),
        }
      },
      themes: {
        files: [{
          expand: true,
          cwd: path.join(revealJsBaseDir, 'css/theme/source'),
          src: ['*.scss'],
          dest: `${base}/css/theme`,
          ext: '.css',
        }, {
          expand: true,
          cwd: 'theme/source',
          src: ['*.scss'],
          dest: `${base}/css/theme`,
          ext: '.css',
        }]
      }
    },
    autoprefixer: {
      [base]: {
        src: `${base}/css/reveal.css`,
      }
    },
    cssmin: {
      compress: {
        files: {
          [base + '/css/reveal.min.css']: [path.join(revealJsBaseDir, 'css/reveal.css')],
        }
      }
    },
    connect: {
      server: {
        options: {
          port,
          base: {
            path: base,
            index: 'index.html',
          },
          livereload: true,
          open: true,
        }
      }
    },
    zip: {
      main: {
        cwd: `${base}/`,
        src: ['**'],
        dest: `${base}/slideshow.zip`,
      }
    },
    watch: {
      js: {
        files: ['Gruntfile.js', 'js'],
        tasks: 'js',
      },
      theme: {
        files: ['theme/source/*.scss', 'theme/template/*.scss'],
        tasks: 'css-themes',
      },
      css: {
        files: ['css/reveal.scss'],
        tasks: 'css-core',
      },
      slides: {
        files: ['index.html', 'slides/**/*.html', 'slides/**/*.md'],
        tasks: ['config:slideshow', 'copy:reveal', 'copy:slideshow']
      },
      options: {
        livereload: true
      }
    }
  })
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-cssmin')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-sass')
  grunt.loadNpmTasks('grunt-contrib-connect')
  grunt.loadNpmTasks('grunt-autoprefixer')
  grunt.loadNpmTasks('grunt-zip')
  grunt.registerTask('build', ['config:slideshow', 'copy:reveal', 'css', 'js', 'copy:slideshow'])
  grunt.registerTask('js', ['uglify'])
  grunt.registerTask('css-themes', ['sass:themes'])
  grunt.registerTask('css-core', ['sass:core', 'autoprefixer', 'cssmin'])
  grunt.registerTask('css', ['sass', 'autoprefixer', 'cssmin'])
  grunt.registerTask('package', ['default', 'zip'])
  grunt.registerTask('config:slideshow', () => {
    const naturalCompare = require('string-natural-compare')
    const baseDir = path.join(__dirname, 'slides')
    const slides = []
    fs.readdirSync(baseDir)
      .sort(naturalCompare.caseInsensitive)
      .forEach(item => {
        const isSubdir = fs
          .statSync(path.join(baseDir, item))
          .isDirectory()
        const o = isSubdir ? {dir: item, slides: []} : {slide: item}
        if (isSubdir) {
          fs.readdirSync(path.join(baseDir, item))
            .filter(slideName => !fs
              .statSync(path.join(baseDir, item, slideName))
              .isDirectory()
            )
            .sort(naturalCompare.caseInsensitive)
            .forEach(child => o.slides.push(child))
        }
        slides.push(o)
      })
    grunt.config.set('slides', slides)
  })
  grunt.registerTask('serve', ['build', 'connect', 'watch'])
}
