FROM ubuntu:14.04
RUN apt-get update
RUN apt-get install -y python3 python3-pip r-base git gcc binutils make linux-source build-essential bedtools blast2
RUN pip3 install numpy
RUN pip3 install scipy
RUN git clone https://github.com/dchandran/Prodigal.git
RUN cd Prodigal && make all && make install
RUN git clone https://github.com/dchandran/cdhit.git
RUN cd cdhit && make all && make install
RUN cd / && git clone https://github.com/dchandran/velvet.git
RUN cd velvet && make
RUN cd / && mv velvet /usr/share/
RUN ln -s /usr/share/velvet/velveth /usr/bin/velveth
RUN ln -s /usr/share/velvet/velvetg /usr/bin/velvetg
RUN git clone https://github.com/tseemann/VelvetOptimiser.git
RUN cd VelvetOptimiser
COPY install_packages.r /install_packages.r
COPY stage1_pipeline.r /stage1_pipeline.r
COPY reads.fasta /reads.fasta
COPY get_dbs.sh /get_dbs.sh
RUN mkdir /blastdb
RUN cd /blastdb && source /get_dbs.sh
RUN R < install_packages.r --no-save