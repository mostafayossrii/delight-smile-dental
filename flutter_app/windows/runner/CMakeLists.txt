cmake_minimum_required(VERSION 3.14)
project(delight_smile_clinic LANGUAGES CXX)

set(BINARY_NAME "delight_smile_clinic")

cmake_policy(SET CMP0079 NEW)

# Add application source files
add_executable(${BINARY_NAME} WIN32
  "main.cpp"
  "flutter_window.cpp"
  "Runner.rc"
  "runner.exe.manifest"
)

target_compile_definitions(${BINARY_NAME} PRIVATE "_UNICODE" "UNICODE")
target_compile_features(${BINARY_NAME} PRIVATE cxx_std_17)
