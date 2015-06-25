FROM ubuntu:14.04
RUN apt-get update
RUN apt-get install -y python3 python3-pip r-base git
RUN pip3 install numpy
RUN pip3 install scipy
RUN git clone https://github.com/dchandran/Prodigal.git
RUN cd Prodigal
RUN make all
RUN make install
RUN git clone https://github.com/dchandran/cdhit.git
RUN cd cdhit
RUN make all
RUN git clone https://github.com/dchandran/velvet.git
RUN cd velvet
RUN make all
RUN git clone https://github.com/tseemann/VelvetOptimiser.git
RUN cd VelvetOptimiser
COPY install_packages.r /tmp/install_packages.r
RUN R CMD BATCH /tmp/install_packages.r