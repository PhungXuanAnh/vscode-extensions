- [1. Prepare env](#1-prepare-env)
- [2. build and install](#2-build-and-install)

# 1. Prepare env

```shell
node -v
# v16.13.0
npm -v
# 8.1.3
npm install

npm install -g vsce
vsce --version
# 2.2.0

venv-create
source_python_venv
python --version
# 3.9.0
pip install -r requirements.txt
```

# 2. build and install

```shell
make package
make install
# make uninstall
```

