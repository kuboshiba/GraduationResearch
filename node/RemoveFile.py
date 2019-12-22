import sys
import glob
import os

args = sys.argv
file_list = glob.glob(args[1] + "*")
for file in file_list:
    print("remove：{0}".format(file))
    os.remove(file)