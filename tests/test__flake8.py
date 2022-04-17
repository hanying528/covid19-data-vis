from os.path import abspath, dirname, join
from subprocess import PIPE, Popen


BACKEND_PATH = join(dirname(dirname(abspath(__file__))), 'backend')


def test_flake8():

    args = ["flake8", BACKEND_PATH, "--ignore=E501"]

    proc = Popen(args, stdout=PIPE, stderr=PIPE)
    out, err = proc.communicate()

    if proc.returncode != 0:
        raise AssertionError("Flake8 issues:\nCalled as: %s\n%s" %
                             (' '.join(args), out.decode("utf-8")))
