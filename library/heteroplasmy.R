args <- commandArgs(TRUE);
hp <- read.csv(args[1], header = T, sep = ";");
png(filename=args[2]);
plot(hp$SNP, hp$heteroplasmy, xlab = "SNP", ylab = "heterolasmy", type = "l");
dev.off();