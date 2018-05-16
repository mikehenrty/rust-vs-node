extern crate simplemad;
extern crate rayon;

use std::io::Error;
use std::fs::{File, DirEntry, read_dir};
use std::path::Path;
use simplemad::Decoder;
use std::time::Duration;
use rayon::prelude::*;

const MP3_FOLDER: &str = "./mp3s/test";

fn get_duration(path: &Path) -> Duration {
    let path = Path::new(path);
    let file = File::open(&path).unwrap();
    let headers = Decoder::decode_headers(file).unwrap();
    headers.filter_map(|r| {
        match r {
            Ok(f) => Some(f.duration),
            Err(_) => None,
        }
    }).fold(Duration::new(0, 0), |acc, dtn| acc + dtn)
}

fn main() {
    let paths = read_dir(MP3_FOLDER).unwrap();
    let v: Vec<Result<DirEntry, Error>> = paths.collect();
    let sum: Duration = v.par_iter().map(|path| {
        let mp3_file = path.as_ref().unwrap().path();
        get_duration(&mp3_file)
    }).sum();
    println!("{:?}", sum.as_secs() / 60);
}
