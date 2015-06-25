FROM ubuntu:14.04
RUN apt-get update
RUN apt-get install -y python3 python3-pip r-base git gcc binutils make linux-source build-essential
RUN pip3 install numpy
RUN pip3 install scipy
RUN git clone https://github.com/dchandran/Prodigal.git
RUN cd Prodigal
RUN make all
RUN make install
RUN git clone https://github.com/dchandran/cdhit.git
RUN cd cdhit && make all && make install
RUN git clone https://github.com/dchandran/velvet.git
RUN cd velvet && make
RUN cd / && mv -R velvet /usr/share/
RUN ln -s /usr/share/velvet/velveth /usr/bin/velveth
RUN ln -s /usr/share/velvet/velvetg /usr/bin/velvetg
RUN git clone https://github.com/tseemann/VelvetOptimiser.git
RUN cd VelvetOptimiser
COPY install_packages.r /install_packages.r
RUN R CMD BATCH /install_packages.r