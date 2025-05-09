alias d := dev
alias b := build
alias u := upload

# watch and serve userscript
dev:
	node build.mjs --dev

# build userscript
build:
	node build.mjs

# upload userscript
upload: build
    rsync -cuhP dist/sillypost.user.js root@phi:/srv/http/
